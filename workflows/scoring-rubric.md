# Lead Qualification Scoring Rubric

## Tier Definitions

| Score | Tier | Badge Color | Meaning |
|-------|------|-------------|---------|
| 75–100 | Hot  | Green  | Strong fit. Prioritize immediately. |
| 40–74  | Warm | Yellow | Potential fit. Nurture and follow up. |
| 0–39   | Cold | Red    | Weak fit. Low priority or disqualify. |

## Scoring Signals

### Positive Signals (push score up)

| Signal | Weight |
|--------|--------|
| Decision maker confirmed (CEO, VP, Director) | High |
| Budget clearly stated and sufficient | High |
| Timeline is immediate or < 3 months | High |
| Pain point is specific and urgent | High |
| Current solutions are inadequate or expensive | Medium |
| Company size is in the target range | Medium |
| Industry is a strong vertical fit | Medium |

### Negative Signals (push score down)

| Signal | Weight |
|--------|--------|
| No budget mentioned or very low budget | High |
| No decision maker access ("just exploring") | High |
| Timeline is vague or > 6 months | Medium |
| Pain point is vague or unclear | Medium |
| Current solution seems adequate | Low |
| Company size outside target range | Low |

## Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `score` | number (0–100) | Numeric qualification score |
| `tier` | "Hot" / "Warm" / "Cold" | Derived from score |
| `summary` | string | 2–3 sentence quality overview |
| `strengths` | string[] | 2–4 positive qualification signals found |
| `concerns` | string[] | 1–3 risk factors (can be empty) |
| `recommendedAction` | string | One specific next step for the sales team |
