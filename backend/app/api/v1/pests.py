from fastapi import APIRouter
from app.schemas.pests import PestPredictionRequest, PestPredictionResponse
from app.services.pests_service import predict_dummy_pest

router = APIRouter()


@router.post("/predict", response_model=PestPredictionResponse)
def predict_pest(body: PestPredictionRequest):
    """
    Dummy pest prediction endpoint.
    """
    # `body` is unused for now, but kept for future image / metadata input.
    return predict_dummy_pest()
