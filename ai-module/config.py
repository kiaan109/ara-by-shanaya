import os
from pathlib import Path

BASE_DIR    = Path(__file__).parent
UPLOAD_DIR  = BASE_DIR / "uploads"
RESULT_DIR  = BASE_DIR / "results"
MODEL_CACHE = BASE_DIR / "model_cache"

for d in [UPLOAD_DIR, RESULT_DIR, MODEL_CACHE]:
    d.mkdir(parents=True, exist_ok=True)

DEVICE = "cpu"

SD_MODEL_ID    = ""
CONTROLNET_ID  = ""
MODEL_CACHE    = BASE_DIR / "model_cache"

MAX_SIZE       = 768
INFERENCE_STEPS = 30
GUIDANCE_SCALE  = 7.5

ALLOWED_ORIGINS = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    os.getenv("ADMIN_URL",    "http://localhost:3001"),
    "http://localhost:3000",
    "http://localhost:3001",
    "*",
]
