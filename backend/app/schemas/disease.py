from pydantic import BaseModel


class DiseasePredictionRequest(BaseModel):
    sample_id: str


class DiseasePredictionResponse(BaseModel):
    disease_name: str
    confidence: float
    severity: str
    treatment: str
