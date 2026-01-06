# backend/app/api/v1/disease.py

from fastapi import APIRouter, UploadFile, File, HTTPException, status

from app.schemas.disease import DiseasePredictionResponse
from app.services.disease_service import predict_disease_from_image

router = APIRouter()


@router.post(
    "/predict",
    response_model=DiseasePredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict mushroom disease from an image",
)
async def predict_disease(file: UploadFile = File(...)):
    """
    Accepts a mushroom image and returns:
      - label: "healthy" | "black_mold" | "green_mold"
      - confidence: 0.0 - 1.0

    The image must be JPG or PNG.
    """

    if file.content_type not in ("image/jpeg", "image/png", "image/jpg"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. "
                   "Please upload a JPG or PNG image.",
        )

    try:
        image_bytes = await file.read()
        prediction = predict_disease_from_image(image_bytes)
    except Exception as e:
        # Good enough for dev; later you can log instead of exposing the error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {e}",
        )

    return DiseasePredictionResponse(
        label=prediction.label,
        confidence=prediction.confidence,
    )
