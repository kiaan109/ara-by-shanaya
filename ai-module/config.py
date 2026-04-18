import os
from pathlib import Path

BASE_DIR    = Path(__file__).parent
UPLOAD_DIR  = BASE_DIR / "uploads"
RESULT_DIR  = BASE_DIR / "results"
MODEL_CACHE = BASE_DIR / "model_cache"

for d in [UPLOAD_DIR, RESULT_DIR, MODEL_CACHE]:
    d.mkdir(parents=True, exist_ok=True)

try:
    import torch
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
except ImportError:
    DEVICE = "cpu"

# Stable Diffusion inpainting model for virtual try-on
# When GPU available, uses full SD inpainting pipeline
# When CPU only, uses lightweight fallback
SD_MODEL_ID    = "runwayml/stable-diffusion-inpainting"
CONTROLNET_ID  = "lllyasviel/sd-controlnet-openpose"

MAX_SIZE       = 768
INFERENCE_STEPS = 30
GUIDANCE_SCALE  = 7.5

ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:3001", "*"]
