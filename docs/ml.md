# ML
The training script creates reproducible synthetic route examples and trains a RandomForestClassifier. Features: distance, crowd level, hazard distance, turns, width, floor, stair count, historical incidents and blocked status. The service returns LOW/MEDIUM/HIGH/CRITICAL. If Flask is unavailable, Node falls back to deterministic risk calculation.
