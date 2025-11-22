from app.schemas.disease import DiseasePredictionResponse


def predict_dummy_disease() -> DiseasePredictionResponse:
    # TODO: integrate disease detection model
    return DiseasePredictionResponse(
        disease_name="Dummy Blotch",
        confidence=0.9,
        severity="moderate",
        treatment="Remove affected mushrooms and improve air circulation.",
    )
