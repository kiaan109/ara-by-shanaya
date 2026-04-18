"""
Human body segmentation using cv2 GrabCut + simple body detection.
In a production VTON pipeline, you would use:
  - SCHP (Self-Correction for Human Parsing) for semantic segmentation
  - or Segment Anything Model (SAM) by Meta
This module provides a working lightweight alternative.
"""
import cv2
import numpy as np
from PIL import Image
from utils.image_utils import pil_to_cv2, cv2_to_pil


def segment_person(img: Image.Image) -> tuple[Image.Image, np.ndarray]:
    """
    Returns (segmented_person_image, binary_mask).
    Binary mask: 255 = person, 0 = background.
    """
    cv_img = pil_to_cv2(img)
    h, w   = cv_img.shape[:2]

    mask     = np.zeros((h, w), dtype=np.uint8)
    bgd_model = np.zeros((1, 65), dtype=np.float64)
    fgd_model = np.zeros((1, 65), dtype=np.float64)

    # Assume person is centered in ~80% of the frame
    margin_x = int(w * 0.08)
    margin_y = int(h * 0.02)
    rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)

    try:
        cv2.grabCut(cv_img, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
        binary_mask = np.where((mask == 2) | (mask == 0), 0, 255).astype(np.uint8)
    except Exception:
        # Fallback: simple rectangular mask
        binary_mask = np.zeros((h, w), dtype=np.uint8)
        binary_mask[margin_y:h - margin_y, margin_x:w - margin_x] = 255

    # Morphological cleanup
    kernel      = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN,  kernel, iterations=1)

    # Apply mask to image
    masked_img = cv_img.copy()
    masked_img[binary_mask == 0] = [255, 255, 255]

    return cv2_to_pil(masked_img), binary_mask


def extract_torso_mask(img: Image.Image) -> Image.Image:
    """
    Returns a PIL mask image (L mode) of the torso region.
    Used to guide inpainting to the clothing area.
    """
    w, h = img.size
    from PIL import ImageDraw, ImageFilter
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    # Torso: roughly center 70% width, 15-70% height
    x1 = int(w * 0.12)
    x2 = int(w * 0.88)
    y1 = int(h * 0.14)
    y2 = int(h * 0.70)
    draw.rounded_rectangle([x1, y1, x2, y2], radius=30, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=15))
    return mask
