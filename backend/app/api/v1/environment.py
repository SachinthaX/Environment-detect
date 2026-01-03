from fastapi import APIRouter
from app.schemas.environment import EnvironmentStatusOut
from app.services.environment_service import get_environment_status
from app.schemas.environment import HistoryResponseOut, AvailableDatesOut
from app.services.environment_service import get_environment_history, get_environment_available_dates
from app.schemas.environment import EnvironmentRecommendationOut
from app.services.environment_service import get_environment_recommendation
from app.schemas.environment import EnvironmentHealthOut
from app.services.environment_service import get_environment_health

from app.schemas.environment import EnvironmentProfileIn, EnvironmentProfileOut, OptimalRangeOut
from app.services.environment_service import (
    get_environment_options,
    get_environment_profile,
    update_environment_profile,
    get_optimal_range,
)


from app.schemas.environment import (
    EnvironmentReadingIn,
    EnvironmentReadingOut,
    EnvironmentRecommendation,
)
from app.services.environment_service import (
    save_environment_reading,
    get_current_environment_reading,
    
)

router = APIRouter()


@router.post("/readings", response_model=EnvironmentReadingOut)
def ingest_environment_reading(payload: EnvironmentReadingIn):
    return save_environment_reading(payload)


@router.get("/status", response_model=EnvironmentStatusOut)
def get_current_environment_status():
    return get_environment_status()



@router.get("/recommendation", response_model=EnvironmentRecommendationOut)
def get_environment_recommendation_api(source: str = "current", date: str | None = None):
    return get_environment_recommendation(source, date)


@router.get("/options")
def environment_options():
    return get_environment_options()


@router.get("/profile", response_model=EnvironmentProfileOut)
def read_profile():
    return get_environment_profile()


@router.put("/profile", response_model=EnvironmentProfileOut)
def write_profile(payload: EnvironmentProfileIn):
    return update_environment_profile(payload)


@router.get("/optimal-range", response_model=OptimalRangeOut)
def read_optimal_range(mushroom_type: str, stage: str):
    return get_optimal_range(mushroom_type, stage)

@router.get("/history", response_model=HistoryResponseOut)
def read_history(range: str, date: str | None = None):
    return get_environment_history(range, date)


@router.get("/available-dates", response_model=AvailableDatesOut)
def read_available_dates():
    return get_environment_available_dates()

@router.get("/health", response_model=EnvironmentHealthOut)
def read_health(offline_after_seconds: int = 60):
    return get_environment_health(offline_after_seconds)
