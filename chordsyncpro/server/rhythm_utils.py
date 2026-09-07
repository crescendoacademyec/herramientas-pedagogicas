"""Pure rhythm helpers shared by the API and its regression tests."""

import math
from statistics import median
from typing import Iterable, List, Optional, Tuple


def robust_bpm(times: Iterable[float]) -> Optional[float]:
    ts = [float(x) for x in times if isinstance(x, (int, float)) and math.isfinite(float(x))]
    if len(ts) < 3:
        return None
    diffs = [b - a for a, b in zip(ts, ts[1:]) if 0.18 <= (b - a) <= 2.0]
    if not diffs:
        return None
    bpm = 60.0 / median(diffs)
    while bpm < 55:
        bpm *= 2
    while bpm > 220:
        bpm /= 2
    return round(bpm, 3)


def infer_meter_from_downbeats(rows: List[Tuple[float, int]]) -> int:
    down_indices = [i for i, (_, beat_type) in enumerate(rows) if int(round(beat_type)) == 1]
    if len(down_indices) >= 2:
        gaps = [b - a for a, b in zip(down_indices, down_indices[1:]) if 2 <= (b - a) <= 12]
        if gaps:
            value = int(round(median(gaps)))
            if value in (3, 4, 6):
                return value
    observed = [int(round(row[1])) for row in rows if 1 <= int(round(row[1])) <= 12]
    if observed and max(observed) in (3, 4, 6):
        return max(observed)
    return 4


def regularity_confidence(times: List[float]) -> float:
    if len(times) < 4:
        return 0.0
    diffs = [b - a for a, b in zip(times, times[1:]) if 0.18 <= (b - a) <= 2.0]
    if len(diffs) < 3:
        return 0.0
    med = median(diffs)
    if med <= 0:
        return 0.0
    mad = median([abs(x - med) for x in diffs])
    regularity = max(0.0, min(1.0, 1.0 - mad / max(0.025, med * 0.22)))
    count_factor = min(1.0, len(times) / 25.0)
    return round(0.78 * regularity + 0.22 * count_factor, 4)
