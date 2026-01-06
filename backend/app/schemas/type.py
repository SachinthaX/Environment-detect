from pydantic import BaseModel
from typing import List, Optional

class TopKItem(BaseModel):
    label: str
    confidence: float

class TypePredictionResponse(BaseModel):
    ok: bool
    label: str
    confidence: float
    top_k: List[TopKItem]
    message: Optional[str] = None
