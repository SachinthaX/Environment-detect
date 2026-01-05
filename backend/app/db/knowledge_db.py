from __future__ import annotations

from typing import Any, Optional

from app.db.pg_pool import pool


def normalize_mushroom_type(mushroom_type: str) -> str:
    """
    Normalizes spacing and returns the canonical DB name if case differs.
    """
    cleaned = " ".join((mushroom_type or "").split())
    if not cleaned:
        return cleaned

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT mushroom_type
                FROM mushroom_optimal_ranges
                WHERE lower(mushroom_type) = lower(%s)
                LIMIT 1;
                """,
                (cleaned,),
            )
            row = cur.fetchone()

    return row["mushroom_type"] if row else cleaned


def list_mushroom_types() -> list[str]:
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT DISTINCT mushroom_type
                FROM mushroom_optimal_ranges
                ORDER BY mushroom_type ASC;
                """
            )
            rows = cur.fetchall() or []
    return [r["mushroom_type"] for r in rows]


def list_stages() -> list[dict[str, str]]:
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT key, label
                FROM mushroom_stages
                ORDER BY key ASC;
                """
            )
            rows = cur.fetchall() or []
    return [{"key": r["key"], "label": r["label"]} for r in rows]


def get_optimal_range(mushroom_type: str, stage_key: str) -> Optional[dict[str, Any]]:
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT temp_min, temp_max, rh_min, rh_max, co2_min, co2_max, co2_note
                FROM mushroom_optimal_ranges
                WHERE mushroom_type = %s AND stage_key = %s
                LIMIT 1;
                """,
                (mushroom_type, stage_key),
            )
            row = cur.fetchone()

    if not row:
        return None

    return {
        "temp_min": float(row["temp_min"]),
        "temp_max": float(row["temp_max"]),
        "rh_min": float(row["rh_min"]),
        "rh_max": float(row["rh_max"]),
        "co2_min": row["co2_min"],
        "co2_max": row["co2_max"],
        "co2_note": row.get("co2_note"),
    }


def list_ranges_for_stage(stage_key: str) -> list[dict[str, Any]]:
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT mushroom_type, temp_min, temp_max, rh_min, rh_max, co2_min, co2_max, co2_note
                FROM mushroom_optimal_ranges
                WHERE stage_key = %s
                ORDER BY mushroom_type ASC;
                """,
                (stage_key,),
            )
            rows = cur.fetchall() or []

    out: list[dict[str, Any]] = []
    for r in rows:
        out.append(
            {
                "mushroom_type": r["mushroom_type"],
                "temp_min": float(r["temp_min"]),
                "temp_max": float(r["temp_max"]),
                "rh_min": float(r["rh_min"]),
                "rh_max": float(r["rh_max"]),
                "co2_min": r["co2_min"],
                "co2_max": r["co2_max"],
                "co2_note": r.get("co2_note"),
            }
        )
    return out
