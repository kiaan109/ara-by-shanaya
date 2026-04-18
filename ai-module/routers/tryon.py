import uuid
import os
import asyncio
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image
import aiofiles

from config import UPLOAD_DIR, RESULT_DIR, MAX_SIZE
from utils.image_utils import load_image, save_image, resize_for_inference
from models.segmentation import segment_person
from models.pose import get_pose_estimator
from models.diffusion import get_pipeline

router = APIRouter()

# In-memory store: {id: filepath}
_persons: dict[str, str] = {}
_cloths:  dict[str, str] = {}


async def save_upload(file: UploadFile, directory: Path) -> tuple[str, str]:
    """Save upload file to disk, return (file_id, file_path)."""
    ext     = Path(file.filename or "upload.jpg").suffix.lower() or ".jpg"
    file_id = uuid.uuid4().hex
    filename = f"{file_id}{ext}"
    dest     = directory / filename

    async with aiofiles.open(dest, "wb") as out:
        content = await file.read()
        await out.write(content)

    return file_id, str(dest)


@router.post("/upload-person")
async def upload_person(file: UploadFile = File(...)):
    """Upload person photo for try-on."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    person_id, path = await save_upload(file, UPLOAD_DIR)
    _persons[person_id] = path

    # Run segmentation in thread pool to not block event loop
    loop = asyncio.get_event_loop()
    try:
        img = await loop.run_in_executor(None, load_image, path)
        segmented, _ = await loop.run_in_executor(None, segment_person, img)
        seg_path = UPLOAD_DIR / f"seg_{person_id}.png"
        await loop.run_in_executor(None, segmented.save, str(seg_path))
    except Exception:
        pass  # Segmentation failure is non-fatal

    return JSONResponse({
        "person_id": person_id,
        "url": f"uploads/{Path(path).name}",
        "message": "Person image uploaded successfully",
    })


@router.post("/upload-cloth")
async def upload_cloth(file: UploadFile = File(...)):
    """Upload clothing image for try-on."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    cloth_id, path = await save_upload(file, UPLOAD_DIR)
    _cloths[cloth_id] = path

    return JSONResponse({
        "cloth_id": cloth_id,
        "url": f"uploads/{Path(path).name}",
        "message": "Cloth image uploaded successfully",
    })


class GenerateRequest(BaseModel):
    person_id: str
    cloth_id:  str


@router.post("/generate")
async def generate_tryon(req: GenerateRequest):
    """Generate virtual try-on result using diffusion pipeline."""
    if req.person_id not in _persons:
        raise HTTPException(status_code=404, detail="Person image not found. Re-upload.")
    if req.cloth_id not in _cloths:
        raise HTTPException(status_code=404, detail="Cloth image not found. Re-upload.")

    person_path = _persons[req.person_id]
    cloth_path  = _cloths[req.cloth_id]

    loop = asyncio.get_event_loop()

    def _run_pipeline():
        person_img = load_image(person_path)
        cloth_img  = load_image(cloth_path)
        pipe       = get_pipeline()
        result     = pipe.generate(person_img, cloth_img)
        filename   = save_image(result, RESULT_DIR, prefix="result")
        return filename

    try:
        filename = await loop.run_in_executor(None, _run_pipeline)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    return JSONResponse({
        "result_url": f"results/{filename}",
        "message":    "Try-on generated successfully",
    })


@router.get("/pose/{person_id}")
async def get_pose(person_id: str):
    """Return pose keypoints for a person image (for debugging/visualization)."""
    if person_id not in _persons:
        raise HTTPException(status_code=404, detail="Person image not found")

    loop = asyncio.get_event_loop()

    def _get_pose():
        img       = load_image(_persons[person_id])
        estimator = get_pose_estimator()
        keypoints = estimator.estimate(img)
        pose_img  = estimator.draw_skeleton(img, keypoints)
        filename  = save_image(pose_img, RESULT_DIR, prefix="pose")
        return filename, keypoints

    filename, keypoints = await loop.run_in_executor(None, _get_pose)

    return JSONResponse({
        "pose_image": f"results/{filename}",
        "keypoints":  {k: {"x": v[0], "y": v[1], "confidence": v[2]} for k, v in keypoints.items()},
    })
