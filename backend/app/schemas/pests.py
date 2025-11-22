from pydantic import BaseModel


class PestPredictionRequest(BaseModel):
    # later this might be an image or image URL; for now just a dummy field
    sample_id: str


class PestPredictionResponse(BaseModel):
    pest_name: str
    confidence: float
    advice: str
