# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.environment import router as environment_router
from app.api.v1.growth import router as growth_router
from app.api.v1.pests import router as pests_router
from app.api.v1.disease import router as disease_router

# If you have mushroom type classification router
from app.api.v1.type import router as type_router

app = FastAPI(
    title="Mushroom Cultivation Backend",
    version="1.0.0",
)

# CORS so your Expo app can talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev; later restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
def ping():
    return {"message": "pong"}


# Environment endpoints
app.include_router(
    environment_router,
    prefix="/api/v1/environment",
    tags=["environment"],
)

# Growth endpoints
app.include_router(
    growth_router,
    prefix="/api/v1/growth",
    tags=["growth"],
)

# Pests endpoints
app.include_router(
    pests_router,
    prefix="/api/v1/pests",
    tags=["pests"],
)

# Disease detection endpoints
app.include_router(
    disease_router,
    prefix="/api/v1/disease",
    tags=["disease"],
)

# Mushroom type classification endpoints (if used)
app.include_router(
    type_router,
    prefix="/api/v1/type",
    tags=["type"],
)
