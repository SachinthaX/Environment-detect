from datetime import datetime, timezone
from app.db.environment_db import get_average_between
from app.schemas.environment import EnvironmentRecommendationOut, RecommendationItemOut
from app.knowledge.mushroom_ranges import MUSHROOM_RANGES
from app.db.environment_db import get_latest_reading_meta
from app.schemas.environment import EnvironmentHealthOut
from zoneinfo import ZoneInfo

from datetime import timedelta

from app.db.environment_db import get_bucketed_averages, get_available_dates
from app.schemas.environment import HistoryResponseOut, HistoryPointOut, AvailableDatesOut

from app.db.environment_db import (
    get_profile,
    set_profile,
    get_alert_state,
    get_alert_states,
    update_alert_state,
    reset_alert_states,
)
from app.schemas.environment import AlertStateOut, EnvironmentStatusOut

from app.knowledge.mushroom_ranges import list_mushrooms, list_stages, get_range
from app.schemas.environment import EnvironmentProfileIn, EnvironmentProfileOut, OptimalRangeOut


from app.schemas.environment import (
    EnvironmentReadingIn,
    EnvironmentReadingOut,
    EnvironmentRecommendation,
)
from app.db.environment_db import insert_reading, get_latest_reading


def save_environment_reading(payload: EnvironmentReadingIn) -> EnvironmentReadingOut:
    row = insert_reading(
        temperature=payload.temperature,
        humidity=payload.humidity,
        co2_estimated=payload.co2,
        node_id=payload.node_id,
        sampled_at=payload.sampled_at,
    )

    # Update alerts only if profile is selected (to know which optimal range to compare)
    prof = get_profile()
    if prof and prof.get("mushroom_type") and prof.get("stage"):
        try:
            optimal = get_range(prof["mushroom_type"], prof["stage"])
            _maybe_update_alerts(row["temperature"], row["humidity"], optimal)
        except Exception:
            # If profile invalid or missing ranges, skip alerts
            pass

    return EnvironmentReadingOut(**row)



def get_current_environment_reading() -> EnvironmentReadingOut:
    row = get_latest_reading()
    if not row:
        return EnvironmentReadingOut(
            id=0,
            sampled_at=datetime.fromtimestamp(0, tz=timezone.utc),
            temperature=0.0,
            humidity=0.0,
            co2_estimated=None,
            node_id=None,
            note="No readings saved yet",
        )
    return EnvironmentReadingOut(**row)


def get_environment_recommendation(source: str, date: str | None = None) -> EnvironmentRecommendationOut:
    temp, rh, n = _get_source_values(source, date)

    if temp is None or rh is None:
        return EnvironmentRecommendationOut(
            source=source,
            temperature=None,
            humidity=None,
            points_used=0,
            recommendations=[],
        )

    # Fruiting only (as you decided)
    items = []
    for mtype, stages in MUSHROOM_RANGES.items():
        if "fruiting" not in stages:
            continue
        r = stages["fruiting"]
        # must have temp/rh ranges
        if r.get("temp_min") is None or r.get("temp_max") is None:
            continue
        if r.get("rh_min") is None or r.get("rh_max") is None:
            continue

        pen, reason = _score_match(temp, rh, r)
        items.append((mtype, pen, reason))

    # sort by best (lowest penalty)
    items.sort(key=lambda x: x[1])

    recommendations = [
        RecommendationItemOut(mushroom_type=m, score=float(pen), reason=reason)
        for (m, pen, reason) in items[:5]
    ]

    return EnvironmentRecommendationOut(
        source=source,
        temperature=temp,
        humidity=rh,
        points_used=n,
        recommendations=recommendations,
    )


def get_environment_options() -> dict:
    return {
        "mushrooms": list_mushrooms(),
        "stages": list_stages(),
    }


def get_environment_profile() -> EnvironmentProfileOut:
    row = get_profile()
    if not row:
        return EnvironmentProfileOut()
    return EnvironmentProfileOut(
        mushroom_type=row.get("mushroom_type"),
        stage=row.get("stage"),
        updated_at=row.get("updated_at"),
    )


def update_environment_profile(payload: EnvironmentProfileIn) -> EnvironmentProfileOut:
    _ = get_range(payload.mushroom_type, payload.stage)

    row = set_profile(payload.mushroom_type, payload.stage)

    # Profile changed => reset alert counters/state
    reset_alert_states()

    return EnvironmentProfileOut(
        mushroom_type=row.get("mushroom_type"),
        stage=row.get("stage"),
        updated_at=row.get("updated_at"),
    )



def get_optimal_range(mushroom_type: str, stage: str) -> OptimalRangeOut:
    r = get_range(mushroom_type, stage)
    return OptimalRangeOut(**r)

def _in_range(value: float, vmin: float, vmax: float) -> bool:
    return vmin <= value <= vmax


def _eval_param(
    param: str,
    value: float,
    vmin: float,
    vmax: float,
    bad_needed: int = 6,
    good_needed: int = 2,
):
    st = get_alert_state(param)
    if not st:
        return

    is_active = int(st["is_active"])
    bad_count = int(st["bad_count"])
    good_count = int(st["good_count"])

    ok = _in_range(value, vmin, vmax)

    if ok:
        good_count += 1
        bad_count = 0
    else:
        bad_count += 1
        good_count = 0

    now = datetime.now(timezone.utc).isoformat()

    message = None
    changed = False

    # Activate
    if is_active == 0 and bad_count >= bad_needed:
        is_active = 1
        changed = True
        message = f"{param.capitalize()} out of range. Current {value:.1f}, optimal {vmin}-{vmax}."

    # Resolve
    if is_active == 1 and good_count >= good_needed:
        is_active = 0
        changed = True
        message = f"{param.capitalize()} back to normal. Current {value:.1f}, optimal {vmin}-{vmax}."

    # Only update state_changed_at when the active flag changes
    state_changed_at = now if changed else st["state_changed_at"]

    update_alert_state(
        param=param,
        is_active=is_active,
        bad_count=bad_count,
        good_count=good_count,
        state_changed_at=state_changed_at,
        last_value=value,
        last_message=message if changed else st.get("last_message"),
    )


def _maybe_update_alerts(temperature: float, humidity: float, optimal_range: dict):
    # Alerts only use Temperature + RH (NOT CO2)
    _eval_param("temperature", temperature, optimal_range["temp_min"], optimal_range["temp_max"])
    _eval_param("humidity", humidity, optimal_range["rh_min"], optimal_range["rh_max"])

def get_environment_status() -> EnvironmentStatusOut:
    reading = get_current_environment_reading()
    prof = get_environment_profile()

    optimal = None
    if prof.mushroom_type and prof.stage:
        try:
            optimal = get_optimal_range(prof.mushroom_type, prof.stage)
        except Exception:
            optimal = None

    alerts_raw = get_alert_states()
    alerts = [
        AlertStateOut(
            param=a["param"],
            active=bool(a["is_active"]),
            bad_count=int(a["bad_count"]),
            good_count=int(a["good_count"]),
            state_changed_at=a["state_changed_at"],
            last_value=a.get("last_value"),
            last_message=a.get("last_message"),
        )
        for a in alerts_raw
    ]

    return EnvironmentStatusOut(
        reading=reading,
        profile=prof,
        optimal_range=optimal,
        alerts=alerts,
    )

def _floor_epoch(epoch: int, bucket_seconds: int) -> int:
    return (epoch // bucket_seconds) * bucket_seconds


def get_environment_history(range_name: str, date: str | None = None) -> HistoryResponseOut:
    now = datetime.now(timezone.utc)
    now_epoch = int(now.timestamp())

    if range_name == "last_1h":
        bucket_seconds = 300  # 5 minutes
        buckets = 12

        # include current (partial) bucket
        end_epoch = _floor_epoch(now_epoch, bucket_seconds) + bucket_seconds
        start_epoch = end_epoch - buckets * bucket_seconds

    elif range_name == "last_day":
        bucket_seconds = 3600  # 1 hour
        buckets = 24

        # include current hour bucket
        end_epoch = _floor_epoch(now_epoch, bucket_seconds) + bucket_seconds
        start_epoch = end_epoch - buckets * bucket_seconds

    elif range_name == "date":
        if not date:
            raise ValueError("date is required when range=date")

        bucket_seconds = 3600
        buckets = 24

        local_tz = ZoneInfo("Asia/Colombo")
        local_start = datetime.fromisoformat(date).replace(tzinfo=local_tz)
        local_end = local_start + timedelta(days=1)

        start_dt_utc = local_start.astimezone(timezone.utc)
        end_dt_utc = local_end.astimezone(timezone.utc)

        start_epoch = int(start_dt_utc.timestamp())
        end_epoch = int(end_dt_utc.timestamp())

        # Align 1-hour buckets to local hour boundaries.
        # For Asia/Colombo (+05:30), offset mod 3600 = 1800 seconds.
        offset_seconds = int(local_start.utcoffset().total_seconds()) % bucket_seconds

    else:
        raise ValueError("range must be one of: last_1h, last_day, date")

    start_iso = datetime.fromtimestamp(start_epoch, tz=timezone.utc).isoformat()
    end_iso = datetime.fromtimestamp(end_epoch, tz=timezone.utc).isoformat()

    agg = get_bucketed_averages(
        start_iso,
        end_iso,
        bucket_seconds,
        offset_seconds=offset_seconds if range_name == "date" else 0,
    )


    points: list[HistoryPointOut] = []
    for i in range(buckets):
        bucket_start_epoch = start_epoch + i * bucket_seconds
        ts = datetime.fromtimestamp(bucket_start_epoch, tz=timezone.utc)

        v = agg.get(bucket_start_epoch)
        if v:
            points.append(
                HistoryPointOut(
                    ts=ts,
                    temperature=v["temperature"],
                    humidity=v["humidity"],
                    co2=v["co2"],
                )
            )
        else:
            points.append(HistoryPointOut(ts=ts, temperature=None, humidity=None, co2=None))

    return HistoryResponseOut(range=range_name, bucket_seconds=bucket_seconds, points=points)


def get_environment_available_dates() -> AvailableDatesOut:
    return AvailableDatesOut(dates=get_available_dates())

def _penalty(value: float, vmin: float, vmax: float) -> float:
    if value < vmin:
        return vmin - value
    if value > vmax:
        return value - vmax
    return 0.0


def _score_match(temp: float, rh: float, r: dict) -> tuple[float, str]:
    # lower penalty = better score
    t_pen = _penalty(temp, r["temp_min"], r["temp_max"])
    h_pen = _penalty(rh, r["rh_min"], r["rh_max"])

    # weight humidity a bit less than temperature (you can tune later)
    total_pen = t_pen * 1.0 + h_pen * 0.5

    reason_parts = []
    if t_pen == 0:
        reason_parts.append("Temp within range")
    else:
        reason_parts.append(f"Temp off by {t_pen:.1f}°C")

    if h_pen == 0:
        reason_parts.append("RH within range")
    else:
        reason_parts.append(f"RH off by {h_pen:.1f}%")

    reason = ", ".join(reason_parts)
    return total_pen, reason


def _get_source_values(source: str, date: str | None):
    now = datetime.now(timezone.utc)
    now_epoch = int(now.timestamp())

    if source == "current":
        latest = get_latest_reading()
        if not latest:
            return None, None, 0
        return float(latest["temperature"]), float(latest["humidity"]), 1

    if source == "last_1h":
        end_epoch = _floor_epoch(now_epoch, 300) + 300
        start_epoch = end_epoch - 12 * 300  # 12 buckets * 5 min
    elif source == "last_day":
        end_epoch = _floor_epoch(now_epoch, 3600) + 3600
        start_epoch = end_epoch - 24 * 3600
    elif source == "date":
        if not date:
            raise ValueError("date is required when source=date")

        local_tz = ZoneInfo("Asia/Colombo")
        local_start = datetime.fromisoformat(date).replace(tzinfo=local_tz)
        local_end = local_start + timedelta(days=1)

        start_epoch = int(local_start.astimezone(timezone.utc).timestamp())
        end_epoch = int(local_end.astimezone(timezone.utc).timestamp())

    else:
        raise ValueError("source must be one of: current, last_1h, last_day, date")

    start_iso = datetime.fromtimestamp(start_epoch, tz=timezone.utc).isoformat()
    end_iso = datetime.fromtimestamp(end_epoch, tz=timezone.utc).isoformat()
    avg = get_average_between(start_iso, end_iso)

    if avg["n"] == 0 or avg["temperature"] is None or avg["humidity"] is None:
        return None, None, 0

    return float(avg["temperature"]), float(avg["humidity"]), int(avg["n"])

def get_environment_health(offline_after_seconds: int = 60) -> EnvironmentHealthOut:
    meta = get_latest_reading_meta()
    if not meta:
        return EnvironmentHealthOut(
            online=False,
            last_seen=None,
            node_id=None,
            seconds_since_last=None,
        )

    last_seen = meta["sampled_at"]
    if isinstance(last_seen, str):
        # ISO string from sqlite (ends with Z sometimes)
        last_seen_dt = datetime.fromisoformat(last_seen.replace("Z", "+00:00"))
    else:
        last_seen_dt = last_seen

    now = datetime.now(timezone.utc)
    seconds_since = int((now - last_seen_dt).total_seconds())

    return EnvironmentHealthOut(
      online=seconds_since <= offline_after_seconds,
      last_seen=last_seen_dt,
      node_id=meta["node_id"],
      seconds_since_last=seconds_since,
    )
