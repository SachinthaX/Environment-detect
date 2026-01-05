from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env FIRST (before importing pool if pool uses env vars)
load_dotenv()

from app.db.environment_db import init_db
from app.db.pg_pool import pool

# Import routers for each feature area
from app.api.v1 import environment, pests, disease, growth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1) open pool when app starts
    pool.open()
    try:
        # 2) init DB (create tables etc.) after pool is available
        init_db()
        yield
    finally:
        # 3) close pool when app stops
        pool.close()


app = FastAPI(
    title="Mushroom Project Backend",
    version="0.2.0",
    lifespan=lifespan,
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
    return {"message": "Backend is working!"}


@app.post("/predict")
def predict(input_data: DummyInput):
    result = input_data.value * 2
    return {
        "input": input_data.value,
        "prediction": result,
        "note": "This is a dummy result. Replace with real model later.",
    }


# --------- API v1 modular routers ---------

app.include_router(environment.router, prefix="/api/v1/environment", tags=["environment"])
app.include_router(pests.router, prefix="/api/v1/pests", tags=["pests"])
app.include_router(disease.router, prefix="/api/v1/disease", tags=["disease"])
app.include_router(growth.router, prefix="/api/v1/growth", tags=["growth"])
