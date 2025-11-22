from app.schemas.growth import GrowthPredictionResponse


def predict_dummy_growth() -> GrowthPredictionResponse:
    # TODO: integrate time-series / image-based growth model
    return GrowthPredictionResponse(
        stage="pinning",
        days_until_harvest=7,
        expected_yield_kg=3.2,
    )
