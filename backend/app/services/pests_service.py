from app.schemas.pests import PestPredictionResponse


def predict_dummy_pest() -> PestPredictionResponse:
    # TODO: plug in your real image model here
    return PestPredictionResponse(
        pest_name="Dummy Mite",
        confidence=0.85,
        advice="Increase ventilation and inspect the growing room for visible mites.",
    )
