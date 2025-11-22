from pydantic import BaseModel


class EnvironmentReading(BaseModel):
    temperature: float
    humidity: float
    co2: float
    ammonia: float
    note: str | None = None


class EnvironmentRecommendation(BaseModel):
    status: str
    recommendation: str
