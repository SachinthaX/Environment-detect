from fastapi import APIRouter
from app.schemas.disease import DiseasePredictionRequest, DiseasePredictionResponse
from app.services.disease_service import predict_dummy_disease

router = APIRouter()


@router.post("/predict", response_model=DiseasePredictionResponse)
def predict_disease(body: DiseasePredictionRequest):
    """
    Dummy disease prediction endpoint.
    """
    return predict_dummy_disease()
