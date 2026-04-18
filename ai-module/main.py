import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from config import UPLOAD_DIR, RESULT_DIR, MODEL_CACHE, ALLOWED_ORIGINS, DEVICE
from routers.tryon import router as tryon_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"ARA AI Module starting on device: {DEVICE}")
    logger.info(f"Upload dir: {UPLOAD_DIR}")
    logger.info(f"Result dir: {RESULT_DIR}")
    # Pre-load pipeline in background
    import asyncio
    loop = asyncio.get_event_loop()
    try:
        from models.diffusion import get_pipeline
        await loop.run_in_executor(None, get_pipeline)
        logger.info("Pipeline pre-loaded.")
    except Exception as e:
        logger.warning(f"Pipeline pre-load skipped: {e}")
    yield
    logger.info("ARA AI Module shutting down.")


app = FastAPI(
    title="ARA by Shanaya — AI Try-On API",
    description="Virtual try-on API powered by Stable Diffusion",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for generated results
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/results", StaticFiles(directory=str(RESULT_DIR)), name="results")

# Routes
app.include_router(tryon_router, tags=["Try-On"])


@app.get("/health")
async def health():
    try:
        import torch
        cuda = torch.cuda.is_available()
        tv   = torch.__version__
    except ImportError:
        cuda = False
        tv   = "not installed"
    return {
        "status": "ok",
        "service": "ARA AI Try-On",
        "device":  DEVICE,
        "cuda_available": cuda,
        "torch_version":  tv,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
