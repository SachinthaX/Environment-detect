import os
from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row

def _require_db_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL is not set")
    return url

# Use open=False and open it on FastAPI startup (recommended).
pool = ConnectionPool(
    conninfo=_require_db_url(),
    min_size=1,
    max_size=5,
    open=False,
    kwargs={"row_factory": dict_row},
)
