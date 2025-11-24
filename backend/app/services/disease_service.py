# backend/app/services/disease_service.py

from dataclasses import dataclass
from io import BytesIO

import numpy as np
from PIL import Image


@dataclass
class DiseasePrediction:
    """
    Internal representation of a disease prediction.
    """
    label: str        # "healthy" | "black_mold" | "green_mold"
    confidence: float


def _load_image(image_bytes: bytes) -> np.ndarray:
    """
    Load the uploaded image into a normalized NumPy array (values 0..1).
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    arr = np.array(image).astype("float32") / 255.0
    return arr


def predict_disease_from_image(image_bytes: bytes) -> DiseasePrediction:
    """
    TEMPORARY HEURISTIC MODEL.

    This is *not* your real CNN. It just uses simple color statistics
    so that you can test the pipeline (backend + mobile app).

    Later, when you train a model in Google Colab, you will:
      - save the trained model to a file
      - load that model here
      - replace this function to use the real model.
    """
    img = _load_image(image_bytes)

    mean_r = float(img[..., 0].mean())
    mean_g = float(img[..., 1].mean())
    mean_b = float(img[..., 2].mean())

    # Very simple rules:
    # - If green channel clearly dominates -> guess "green_mold"
    # - If image is dark & a bit reddish -> guess "black_mold"
    # - Otherwise -> "healthy"

    avg_brightness = (mean_r + mean_g + mean_b) / 3.0

    if mean_g > mean_r + 0.05 and mean_g > mean_b + 0.05:
        label = "green_mold"
        confidence = 0.7
    elif avg_brightness < 0.35 and mean_r > mean_b:
        label = "black_mold"
        confidence = 0.7
    else:
        label = "healthy"
        confidence = 0.6

    return DiseasePrediction(label=label, confidence=confidence)
