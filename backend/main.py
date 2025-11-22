from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import routers for each feature area
from app.api.v1 import environment, pests, disease, growth


app = FastAPI(
    title="Mushroom Project Backend",
    version="0.2.0",
)

# During development allow all origins (mobile app, emulator, physical phone, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------- Existing demo endpoints (keep for Home screen test) ---------

class DummyInput(BaseModel):
    value: float


@app.get("/ping")
def ping():
    """
    Simple health check endpoint.
    """
    return {"message": "Backend is working!"}


@app.post("/predict")
def predict(input_data: DummyInput):
    """
    Dummy ML endpoint for testing.
    For now: prediction = value * 2
    """
    result = input_data.value * 2
    return {
        "input": input_data.value,
        "prediction": result,
        "note": "This is a dummy result. Replace with real model later.",
    }


# --------- API v1 modular routers ---------

app.include_router(
    environment.router,
    prefix="/api/v1/environment",
    tags=["environment"],
)

app.include_router(
    pests.router,
    prefix="/api/v1/pests",
    tags=["pests"],
)

app.include_router(
    disease.router,
    prefix="/api/v1/disease",
    tags=["disease"],
)

app.include_router(
    growth.router,
    prefix="/api/v1/growth",
    tags=["growth"],
)
