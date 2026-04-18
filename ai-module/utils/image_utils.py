import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
from pathlib import Path
import uuid


def load_image(path: str) -> Image.Image:
    img = Image.open(path)
    if img.mode != "RGB":
        img = img.convert("RGB")
    return img


def save_image(img: Image.Image, directory: Path, prefix: str = "img") -> str:
    filename = f"{prefix}_{uuid.uuid4().hex[:8]}.png"
    path = directory / filename
    img.save(path, format="PNG", optimize=True)
    return filename


def resize_for_inference(img: Image.Image, max_size: int = 768) -> Image.Image:
    w, h = img.size
    if max(w, h) <= max_size:
        return img
    ratio = max_size / max(w, h)
    new_w, new_h = int(w * ratio), int(h * ratio)
    new_w = (new_w // 8) * 8
    new_h = (new_h // 8) * 8
    return img.resize((new_w, new_h), Image.LANCZOS)


def pil_to_cv2(img: Image.Image) -> np.ndarray:
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def cv2_to_pil(arr: np.ndarray) -> Image.Image:
    return Image.fromarray(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB))


def remove_background(img: Image.Image) -> Image.Image:
    """Remove background from image using rembg. Returns RGBA image."""
    try:
        import rembg
        img_bytes = img.tobytes()
        # rembg works on bytes
        import io
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        result_bytes = rembg.remove(buf.read())
        result = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
        return result
    except Exception as e:
        print(f"rembg failed: {e}, using GrabCut fallback")
        return _grabcut_remove_bg(img)


def _grabcut_remove_bg(img: Image.Image) -> Image.Image:
    """GrabCut-based background removal fallback."""
    cv_img = pil_to_cv2(img)
    h, w = cv_img.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    bgd = np.zeros((1, 65), dtype=np.float64)
    fgd = np.zeros((1, 65), dtype=np.float64)
    margin_x, margin_y = int(w * 0.05), int(h * 0.02)
    rect = (margin_x, margin_y, w - 2*margin_x, h - 2*margin_y)
    try:
        cv2.grabCut(cv_img, mask, rect, bgd, fgd, 5, cv2.GC_INIT_WITH_RECT)
        binary = np.where((mask == 2) | (mask == 0), 0, 255).astype(np.uint8)
    except Exception:
        binary = np.zeros((h, w), dtype=np.uint8)
        binary[margin_y:h-margin_y, margin_x:w-margin_x] = 255

    # Clean up
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, k, iterations=3)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN,  k, iterations=1)
    binary = cv2.GaussianBlur(binary, (5, 5), 0)

    rgba = cv2.cvtColor(cv_img, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = binary
    return Image.fromarray(cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA))


def smart_overlay_clothing(person_img: Image.Image, cloth_img: Image.Image) -> Image.Image:
    """
    Improved compositing:
    1. Remove background from clothing using rembg
    2. Detect torso region from person using GrabCut
    3. Scale clothing to fit torso + alpha-blend with feathered edges
    """
    pw, ph = person_img.size

    # ── Step 1: Extract clothing with transparency ──
    cloth_nobg = remove_background(cloth_img)  # RGBA

    # Get bounding box of actual clothing pixels (non-transparent)
    if cloth_nobg.mode == "RGBA":
        alpha = np.array(cloth_nobg)[:, :, 3]
        rows  = np.any(alpha > 30, axis=1)
        cols  = np.any(alpha > 30, axis=0)
        if rows.any() and cols.any():
            rmin, rmax = np.where(rows)[0][[0, -1]]
            cmin, cmax = np.where(cols)[0][[0, -1]]
            cloth_nobg = cloth_nobg.crop((cmin, rmin, cmax, rmax))
    else:
        cloth_nobg = cloth_nobg.convert("RGBA")

    cw, ch = cloth_nobg.size

    # ── Step 2: Define torso target area on person ──
    # Torso: center of frame, roughly 20%-75% height, 15%-85% width
    torso_x1 = int(pw * 0.12)
    torso_x2 = int(pw * 0.88)
    torso_y1 = int(ph * 0.17)
    torso_y2 = int(ph * 0.78)
    torso_w  = torso_x2 - torso_x1
    torso_h  = torso_y2 - torso_y1

    # ── Step 3: Scale clothing to fit torso maintaining aspect ratio ──
    scale = min(torso_w / cw, torso_h / ch) * 0.92
    new_cw = max(int(cw * scale), 1)
    new_ch = max(int(ch * scale), 1)
    cloth_scaled = cloth_nobg.resize((new_cw, new_ch), Image.LANCZOS)

    # Center in torso area
    paste_x = torso_x1 + (torso_w - new_cw) // 2
    paste_y = torso_y1 + (torso_h - new_ch) // 2

    # ── Step 4: Feather edges of clothing alpha mask ──
    cloth_arr = np.array(cloth_scaled).astype(float)
    if cloth_arr.shape[2] == 4:
        alpha_ch = cloth_arr[:, :, 3]
        # Soften edges with Gaussian blur
        alpha_smooth = cv2.GaussianBlur(alpha_ch.astype(np.uint8), (21, 21), 0).astype(float)
        # Slightly reduce overall opacity for blending
        alpha_smooth = np.clip(alpha_smooth * 0.92, 0, 255)
        cloth_arr[:, :, 3] = alpha_smooth
        cloth_scaled = Image.fromarray(cloth_arr.astype(np.uint8), "RGBA")

    # ── Step 5: Composite onto person ──
    result = person_img.copy().convert("RGBA")
    canvas = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    canvas.paste(cloth_scaled, (paste_x, paste_y), cloth_scaled)
    final  = Image.alpha_composite(result, canvas)
    return final.convert("RGB")


# Keep old name as alias
def overlay_clothing(person_img: Image.Image, cloth_img: Image.Image) -> Image.Image:
    return smart_overlay_clothing(person_img, cloth_img)


def enhance_result(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Sharpness(img).enhance(1.15)
    img = ImageEnhance.Color(img).enhance(1.05)
    return img
