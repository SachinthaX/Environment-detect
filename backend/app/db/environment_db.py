from __future__ import annotations

import sqlite3
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Any, Dict
from zoneinfo import ZoneInfo

# This resolves to: backend/environment.db
BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / "environment.db"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS environment_readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sampled_at TEXT NOT NULL,
                temperature REAL NOT NULL,
                humidity REAL NOT NULL,
                co2_estimated REAL,
                node_id TEXT
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_env_sampled_at ON environment_readings(sampled_at)"
        )
        
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS environment_profile (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                mushroom_type TEXT,
                stage TEXT,
                updated_at TEXT NOT NULL
            )
            """
        )

        conn.execute(
            """
            INSERT OR IGNORE INTO environment_profile (id, mushroom_type, stage, updated_at)
            VALUES (1, NULL, NULL, ?)
            """,
            (datetime.now(timezone.utc).isoformat(),),
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS environment_alert_state (
                param TEXT PRIMARY KEY,
                is_active INTEGER NOT NULL,
                bad_count INTEGER NOT NULL,
                good_count INTEGER NOT NULL,
                state_changed_at TEXT NOT NULL,
                last_value REAL,
                last_message TEXT
            )
            """
        )

        # seed rows for temperature + humidity
        now = datetime.now(timezone.utc).isoformat()
        conn.execute(
            """
            INSERT OR IGNORE INTO environment_alert_state
            (param, is_active, bad_count, good_count, state_changed_at, last_value, last_message)
            VALUES
            ('temperature', 0, 0, 0, ?, NULL, NULL),
            ('humidity',    0, 0, 0, ?, NULL, NULL)
            """,
            (now, now),
        )


        conn.commit()


def insert_reading(
    temperature: float,
    humidity: float,
    co2_estimated: Optional[float],
    node_id: Optional[str],
    sampled_at: Optional[datetime] = None,
) -> Dict[str, Any]:
    ts = sampled_at or datetime.now(timezone.utc)
    ts_str = ts.isoformat()

    with _connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO environment_readings (sampled_at, temperature, humidity, co2_estimated, node_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            (ts_str, temperature, humidity, co2_estimated, node_id),
        )
        new_id = cur.lastrowid
        conn.commit()

        row = conn.execute(
            "SELECT * FROM environment_readings WHERE id = ?",
            (new_id,),
        ).fetchone()

        return dict(row)


def get_latest_reading() -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM environment_readings ORDER BY sampled_at DESC, id DESC LIMIT 1"
        ).fetchone()
        return dict(row) if row else None
    
def get_profile():
    with _connect() as conn:
        row = conn.execute("SELECT * FROM environment_profile WHERE id = 1").fetchone()
        return dict(row) if row else None


def set_profile(mushroom_type: str, stage: str):
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            """
            UPDATE environment_profile
            SET mushroom_type = ?, stage = ?, updated_at = ?
            WHERE id = 1
            """,
            (mushroom_type, stage, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM environment_profile WHERE id = 1").fetchone()
        return dict(row)

def get_alert_states():
    with _connect() as conn:
        rows = conn.execute("SELECT * FROM environment_alert_state").fetchall()
        return [dict(r) for r in rows]


def get_alert_state(param: str):
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM environment_alert_state WHERE param = ?",
            (param,),
        ).fetchone()
        return dict(row) if row else None


def update_alert_state(
    param: str,
    is_active: int,
    bad_count: int,
    good_count: int,
    state_changed_at: str,
    last_value: float | None,
    last_message: str | None,
):
    with _connect() as conn:
        conn.execute(
            """
            UPDATE environment_alert_state
            SET is_active = ?, bad_count = ?, good_count = ?, state_changed_at = ?, last_value = ?, last_message = ?
            WHERE param = ?
            """,
            (is_active, bad_count, good_count, state_changed_at, last_value, last_message, param),
        )
        conn.commit()
        return get_alert_state(param)


def reset_alert_states():
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            """
            UPDATE environment_alert_state
            SET is_active = 0,
                bad_count = 0,
                good_count = 0,
                state_changed_at = ?,
                last_value = NULL,
                last_message = NULL
            """,
            (now,),
        )
        conn.commit()
        return get_alert_states()

def get_available_dates() -> list[str]:
    local_tz = ZoneInfo("Asia/Colombo")

    with _connect() as conn:
        rows = conn.execute(
            "SELECT sampled_at FROM environment_readings ORDER BY sampled_at DESC"
        ).fetchall()

    days = set()
    for r in rows:
        s = r["sampled_at"]
        dt_utc = datetime.fromisoformat(s.replace("Z", "+00:00"))
        dt_local = dt_utc.astimezone(local_tz)
        days.add(dt_local.date().isoformat())

    return sorted(days, reverse=True)


def get_bucketed_averages(
    start_iso: str,
    end_iso: str,
    bucket_seconds: int,
    offset_seconds: int = 0,
) -> dict[int, dict]:
    """
    Returns mapping:
      bucket_start_epoch_seconds -> {temperature, humidity, co2}

    offset_seconds lets us shift bucket boundaries.
    Example: Asia/Colombo is +05:30, for 1-hour buckets offset_seconds = 1800,
    which makes buckets start at xx:30 UTC (local hour boundaries).
    """
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT
              ((CAST(strftime('%s', sampled_at) AS INTEGER) + ?) / ?) AS bucket_id,
              AVG(temperature) AS temperature_avg,
              AVG(humidity) AS humidity_avg,
              AVG(co2_estimated) AS co2_avg
            FROM environment_readings
            WHERE sampled_at >= ? AND sampled_at < ?
            GROUP BY bucket_id
            """,
            (offset_seconds, bucket_seconds, start_iso, end_iso),
        ).fetchall()

    out: dict[int, dict] = {}
    for r in rows:
        bucket_id = int(r["bucket_id"])
        bucket_start = bucket_id * bucket_seconds - offset_seconds

        out[bucket_start] = {
            "temperature": r["temperature_avg"],
            "humidity": r["humidity_avg"],
            "co2": r["co2_avg"],
        }
    return out


def get_average_between(start_iso: str, end_iso: str) -> dict:
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT
              AVG(temperature) AS temperature_avg,
              AVG(humidity) AS humidity_avg,
              AVG(co2_estimated) AS co2_avg,
              COUNT(*) AS n
            FROM environment_readings
            WHERE sampled_at >= ? AND sampled_at < ?
            """,
            (start_iso, end_iso),
        ).fetchone()

    if not row or row["n"] == 0:
        return {"temperature": None, "humidity": None, "co2": None, "n": 0}

    return {
        "temperature": row["temperature_avg"],
        "humidity": row["humidity_avg"],
        "co2": row["co2_avg"],
        "n": int(row["n"]),
    }

def get_latest_reading_meta():
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT node_id, sampled_at
            FROM environment_readings
            ORDER BY sampled_at DESC
            LIMIT 1
            """
        ).fetchone()

    if not row:
        return None
    return {"node_id": row["node_id"], "sampled_at": row["sampled_at"]}
