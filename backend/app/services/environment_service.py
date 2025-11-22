from app.schemas.environment import EnvironmentReading, EnvironmentRecommendation


def get_dummy_environment_reading() -> EnvironmentReading:
    # TODO: replace with real sensor / DB data
    return EnvironmentReading(
        temperature=24.5,
        humidity=85.0,
        co2=650.0,
        ammonia=4.5,
        note="Dummy environment data from service layer",
    )


def get_dummy_environment_recommendation() -> EnvironmentRecommendation:
    # TODO: replace with ML / rules-based recommendations
    return EnvironmentRecommendation(
        status="OK",
        recommendation="Maintain humidity above 80% and keep temperature around 24°C.",
    )
