from fastapi import APIRouter, UploadFile, File, HTTPException

from app.schemas.type import TypePredictionResponse, TopKItem
from app.services.type_service import predict_type, ALLOWED_CONTENT_TYPES

router = APIRouter(tags=["Mushroom Type"])  # <-- removed prefix="/type"


@router.post("/predict", response_model=TypePredictionResponse)
async def predict_mushroom_type(file: UploadFile = File(...)):
    # 1) Validate file type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Use JPEG/PNG/WEBP."
        )

    # 2) Read bytes
    data = await file.read()
    if not data or len(data) < 100:
        raise HTTPException(status_code=400, detail="Empty or invalid image.")

    # 3) Predict
    try:
        ok, label, confidence, top_k, message = predict_type(data)

        return TypePredictionResponse(
            ok=ok,
            label=label,
            confidence=confidence,
            top_k=[TopKItem(label=l, confidence=c) for (l, c) in top_k],
            message=message
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Model files missing: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
