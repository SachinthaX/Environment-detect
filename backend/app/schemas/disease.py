# backend/app/schemas/disease.py

from pydantic import BaseModel


class DiseasePredictionResponse(BaseModel):
    """
    Response returned to the mobile app after disease prediction.
    """
    label: str        # "healthy" | "black_mold" | "green_mold"
    confidence: float # 0.0 - 1.0
