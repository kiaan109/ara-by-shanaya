"""
Virtual Try-On pipeline.

Priority order:
  1. IDM-VTON via Hugging Face Gradio API (free, no GPU needed)
  2. Smart CPU compositing with rembg (improved fallback)
"""
import os
import io
import logging
import tempfile
from PIL import Image
from config import DEVICE, SD_MODEL_ID, INFERENCE_STEPS, GUIDANCE_SCALE, MODEL_CACHE
from utils.image_utils import resize_for_inference, smart_overlay_clothing, enhance_result

logger = logging.getLogger(__name__)


def _prepare_garment_image(cloth_img: Image.Image) -> Image.Image:
    """
    Extract just the garment from a model/product photo.
    Uses rembg to remove background, leaving a clean garment-only image on white.
    """
    try:
        import rembg
        buf = io.BytesIO()
        cloth_img.save(buf, "PNG")
        buf.seek(0)
        result_bytes = rembg.remove(buf.read())
        result = Image.open(io.BytesIO(result_bytes)).convert("RGBA")

        # Paste onto white background
        white = Image.new("RGBA", result.size, (255, 255, 255, 255))
        white.paste(result, mask=result.split()[3])
        return white.convert("RGB")
    except Exception as e:
        logger.warning(f"Garment prep failed: {e}, using original")
        return cloth_img


class VTONPipeline:
    def __init__(self):
        self.mode = "fallback"
        self._hf_client = None
        self._try_load_hf()

    def _try_load_hf(self):
        """Try to connect to IDM-VTON on Hugging Face Spaces."""
        try:
            from gradio_client import Client
            logger.info("Connecting to IDM-VTON on Hugging Face...")
            self._hf_client = Client("yisol/IDM-VTON", verbose=False)
            self.mode = "idm_vton_hf"
            logger.info("IDM-VTON HF client connected.")
        except Exception as e:
            logger.warning(f"Could not connect to IDM-VTON HF: {e}. Using compositing fallback.")
            self.mode = "fallback"

    def generate(self, person_img: Image.Image, cloth_img: Image.Image) -> Image.Image:
        person_img  = resize_for_inference(person_img, max_size=768)
        cloth_clean = _prepare_garment_image(resize_for_inference(cloth_img, max_size=768))

        if self.mode == "idm_vton_hf" and self._hf_client is not None:
            try:
                return self._generate_hf(person_img, cloth_clean)
            except Exception as e:
                logger.warning(f"HF IDM-VTON failed: {e}. Falling back to compositing.")

        return self._generate_fallback(person_img, cloth_clean)

    def _generate_hf(self, person_img: Image.Image, cloth_img: Image.Image) -> Image.Image:
        """Call IDM-VTON on Hugging Face Spaces."""
        from gradio_client import handle_file

        with tempfile.TemporaryDirectory() as tmp:
            person_path = os.path.join(tmp, "person.jpg")
            cloth_path  = os.path.join(tmp, "cloth.jpg")
            person_img.save(person_path, "JPEG", quality=95)
            cloth_img.save(cloth_path,  "JPEG", quality=95)

            logger.info("Sending to IDM-VTON HF API...")
            result = self._hf_client.predict(
                dict={
                    "background": handle_file(person_path),
                    "layers": [],
                    "composite": None,
                },
                garm_img=handle_file(cloth_path),
                garment_des="a fashion garment",
                is_checked=True,
                is_checked_crop=False,
                denoise_steps=30,
                seed=42,
                api_name="/tryon"
            )

            # Extract result image path
            result_path = result[0] if isinstance(result, (list, tuple)) else result
            if hasattr(result_path, 'path'):
                result_path = result_path.path
            elif isinstance(result_path, dict):
                result_path = result_path.get('path') or result_path.get('url', '')

            out = Image.open(str(result_path)).convert("RGB")
            logger.info("IDM-VTON HF result received.")
            return enhance_result(out)

    def _generate_fallback(self, person_img: Image.Image, cloth_img: Image.Image) -> Image.Image:
        """Improved CPU compositing with rembg background removal."""
        logger.info("Using rembg compositing fallback.")
        result = smart_overlay_clothing(person_img, cloth_img)
        return enhance_result(result)


_pipeline: VTONPipeline | None = None


def get_pipeline() -> VTONPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = VTONPipeline()
    return _pipeline
