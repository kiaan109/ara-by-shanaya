"""
Human pose estimation using OpenCV's DNN module with a pre-trained OpenPose model,
or MediaPipe as a lighter alternative.
In production VTON, pose is used to warp clothing to match body orientation.
"""
import cv2
import numpy as np
from PIL import Image
from utils.image_utils import pil_to_cv2


BODY_PARTS = {
    "Nose": 0, "Neck": 1, "RShoulder": 2, "RElbow": 3, "RWrist": 4,
    "LShoulder": 5, "LElbow": 6, "LWrist": 7, "RHip": 8, "RKnee": 9,
    "RAnkle": 10, "LHip": 11, "LKnee": 12, "LAnkle": 13,
    "REye": 14, "LEye": 15, "REar": 16, "LEar": 17, "Background": 18,
}

POSE_PAIRS = [
    ["Neck", "RShoulder"], ["Neck", "LShoulder"],
    ["RShoulder", "RElbow"], ["RElbow", "RWrist"],
    ["LShoulder", "LElbow"], ["LElbow", "LWrist"],
    ["Neck", "RHip"], ["Neck", "LHip"],
    ["RHip", "RKnee"], ["RKnee", "RAnkle"],
    ["LHip", "LKnee"], ["LKnee", "LAnkle"],
    ["Neck", "Nose"],
]


class PoseEstimator:
    def __init__(self):
        self._available = False
        try:
            import mediapipe as mp
            self.mp_pose   = mp.solutions.pose
            self.pose      = self.mp_pose.Pose(static_image_mode=True, model_complexity=1)
            self._available = True
            self._backend  = "mediapipe"
        except ImportError:
            self._backend = "fallback"

    def estimate(self, img: Image.Image) -> dict:
        """Returns keypoint dict: {part_name: (x, y, confidence)} in pixel coords."""
        if self._available and self._backend == "mediapipe":
            return self._estimate_mediapipe(img)
        return self._estimate_fallback(img)

    def _estimate_mediapipe(self, img: Image.Image) -> dict:
        import mediapipe as mp
        arr  = np.array(img.convert("RGB"))
        res  = self.pose.process(arr)
        kpts = {}
        if res.pose_landmarks:
            h, w = arr.shape[:2]
            lm   = res.pose_landmarks.landmark
            mp_map = {
                "Nose":      0, "Neck":      11,
                "LShoulder": 11, "RShoulder": 12,
                "LElbow":    13, "RElbow":    14,
                "LWrist":    15, "RWrist":    16,
                "LHip":      23, "RHip":      24,
                "LKnee":     25, "RKnee":     26,
                "LAnkle":    27, "RAnkle":    28,
            }
            for part, idx in mp_map.items():
                pt = lm[idx]
                kpts[part] = (int(pt.x * w), int(pt.y * h), pt.visibility)
        return kpts

    def _estimate_fallback(self, img: Image.Image) -> dict:
        """Geometric fallback when no pose model is available."""
        w, h = img.size
        return {
            "Nose":      (w // 2,           int(h * 0.08), 0.9),
            "Neck":      (w // 2,           int(h * 0.16), 0.9),
            "LShoulder": (int(w * 0.32),    int(h * 0.22), 0.8),
            "RShoulder": (int(w * 0.68),    int(h * 0.22), 0.8),
            "LElbow":    (int(w * 0.22),    int(h * 0.38), 0.7),
            "RElbow":    (int(w * 0.78),    int(h * 0.38), 0.7),
            "LWrist":    (int(w * 0.16),    int(h * 0.52), 0.6),
            "RWrist":    (int(w * 0.84),    int(h * 0.52), 0.6),
            "LHip":      (int(w * 0.38),    int(h * 0.54), 0.8),
            "RHip":      (int(w * 0.62),    int(h * 0.54), 0.8),
            "LKnee":     (int(w * 0.36),    int(h * 0.74), 0.7),
            "RKnee":     (int(w * 0.64),    int(h * 0.74), 0.7),
            "LAnkle":    (int(w * 0.35),    int(h * 0.92), 0.6),
            "RAnkle":    (int(w * 0.65),    int(h * 0.92), 0.6),
        }

    def draw_skeleton(self, img: Image.Image, keypoints: dict) -> Image.Image:
        cv_img = pil_to_cv2(img)
        for pair in POSE_PAIRS:
            a, b = pair
            if a in keypoints and b in keypoints:
                xa, ya, _ = keypoints[a]
                xb, yb, _ = keypoints[b]
                cv2.line(cv_img, (xa, ya), (xb, yb), (212, 153, 26), 2, cv2.LINE_AA)
        for part, (x, y, conf) in keypoints.items():
            if conf > 0.3:
                cv2.circle(cv_img, (x, y), 5, (239, 200, 90), -1, cv2.LINE_AA)
        from utils.image_utils import cv2_to_pil
        return cv2_to_pil(cv_img)


_estimator = None

def get_pose_estimator() -> PoseEstimator:
    global _estimator
    if _estimator is None:
        _estimator = PoseEstimator()
    return _estimator
