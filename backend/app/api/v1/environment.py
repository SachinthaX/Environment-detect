from fastapi import APIRouter
from app.schemas.environment import EnvironmentReading, EnvironmentRecommendation
from app.services.environment_service import (
    get_dummy_environment_reading,
    get_dummy_environment_recommendation,
)

router = APIRouter()


@router.get("/status", response_model=EnvironmentReading)
def get_current_environment_status():
    """
    Returns the latest environment reading.
    Right now this uses dummy data from the service layer.
    """
    return get_dummy_environment_reading()


@router.get("/recommendation", response_model=EnvironmentRecommendation)
def get_environment_recommendation():
    """
    Returns a simple environment recommendation.
    """
    return get_dummy_environment_recommendation()
