from pydantic import BaseModel


class GrowthPredictionRequest(BaseModel):
    sample_id: str


class GrowthPredictionResponse(BaseModel):
    stage: str
    days_until_harvest: int
    expected_yield_kg: float
