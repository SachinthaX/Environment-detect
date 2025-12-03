# backend/app/services/disease_service.py

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image
import tensorflow as tf


@dataclass
class DiseasePrediction:
    """
    Internal representation of a disease prediction.
    """
    label: str
    confidence: float


# Must match the order used in Colab:
# CLASS_NAMES = ['healthy', 'black_mold', 'green_mold']
CLASS_NAMES = ["healthy", "black_mold", "green_mold"]

IMG_SIZE = (224, 224)

# If max softmax probability is below this, we call it "invalid" / not a mushroom bag
CONFIDENCE_THRESHOLD = 0.80  # you can tune this value later
INVALID_LABEL = "invalid_image"

# Path to backend/models/mushroom_disease_model.h5
BASE_DIR = Path(__file__).resolve().parents[2]  # .../backend
MODEL_PATH = BASE_DIR / "models" / "mushroom_disease_model.h5"

_model = None


def _get_model():
    """
    Load the TensorFlow model once and reuse it.
    """
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        _model = tf.keras.models.load_model(MODEL_PATH)
    return _model


def _preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Convert uploaded image bytes into a batch tensor.

    The Keras model already has a Rescaling layer that converts
    [0, 255] -> [-1, 1]. So here we only:
      - load the image
      - resize
      - convert to float32
      - add batch dimension
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image = image.resize(IMG_SIZE)

    arr = np.array(image).astype("float32")  # values 0..255
    arr = np.expand_dims(arr, axis=0)       # shape (1, 224, 224, 3)

    return arr


def predict_disease_from_image(image_bytes: bytes) -> DiseasePrediction:
    """
    Run inference using the trained Keras model and return label + confidence.

    If the model is not confident enough (max probability < CONFIDENCE_THRESHOLD),
    we treat the image as invalid / out-of-domain.
    """
    model = _get_model()
    input_tensor = _preprocess_image(image_bytes)

    preds = model.predict(input_tensor)
    preds = preds[0]  # shape (num_classes,)

    class_idx = int(np.argmax(preds))
    confidence = float(preds[class_idx])

    if confidence < CONFIDENCE_THRESHOLD:
        # Not confident -> we say this is not a valid mushroom-disease image
        return DiseasePrediction(label=INVALID_LABEL, confidence=confidence)

    label = CLASS_NAMES[class_idx]
    return DiseasePrediction(label=label, confidence=confidence)
