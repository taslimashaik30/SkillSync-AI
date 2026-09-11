"""Read-only skill-demand reference data derived from the supplied dataset."""

import csv
from functools import lru_cache
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "skill_demand.csv"


@lru_cache(maxsize=1)
def get_skill_demand() -> dict[str, float]:
    """Load the compact normalized demand data once per application process."""
    if not DATA_PATH.is_file():
        return {}

    with DATA_PATH.open(encoding="utf-8", newline="") as handle:
        return {
            row["skill"].strip().casefold(): float(row["percentage"])
            for row in csv.DictReader(handle)
            if row.get("skill") and row.get("percentage")
        }


def demand_based_required_level(skill_name: str, fallback: int) -> int:
    """Return a conservative requirement only for a dataset-matched skill."""
    demand = get_skill_demand().get(skill_name.strip().casefold())
    if demand is None:
        return fallback
    if demand >= 50:
        return 5
    if demand >= 10:
        return max(fallback, 4)
    return fallback
