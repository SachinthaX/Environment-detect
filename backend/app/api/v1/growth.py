from fastapi import APIRouter
from app.schemas.growth import GrowthPredictionRequest, GrowthPredictionResponse
from app.services.growth_service import predict_dummy_growth

router = APIRouter()


@router.post("/predict", response_model=GrowthPredictionResponse)
def predict_growth(body: GrowthPredictionRequest):
    """
    Dummy growth prediction endpoint.
    """
    return predict_dummy_growth()
