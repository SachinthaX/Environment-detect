from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(
    title="Mushroom Project Backend",
    version="0.1.0",
)

# During development allow all origins (mobile app, emulator, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
