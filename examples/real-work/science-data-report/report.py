from __future__ import annotations

from dataclasses import dataclass
from statistics import mean, pstdev


@dataclass(frozen=True)
class SeriesReport:
    name: str
    count: int
    average: float
    volatility: float
    minimum: float
    maximum: float


def summarize(name: str, values: list[float]) -> SeriesReport:
    if not values:
        raise ValueError("values cannot be empty")
    return SeriesReport(
        name=name,
        count=len(values),
        average=round(mean(values), 4),
        volatility=round(pstdev(values), 4),
        minimum=min(values),
        maximum=max(values),
    )


def main() -> None:
    sample = [12.1, 12.8, 13.4, 13.1, 14.2, 15.0, 14.7]
    report = summarize("activation_minutes", sample)
    print(report)


if __name__ == "__main__":
    main()
