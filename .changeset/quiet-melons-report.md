---
"@smithy/core": minor
---

add client metrics: a metrics middleware (@smithy/core/metrics) that drives the begin/record-outcome/end lifecycle for a recorder on the handler execution context (no-op when absent), plus per-middleware metrics emitted into that recorder where meaningful — retry attempts, retry delay, and throttled-exception count from the retry middleware, serialization and deserialization time from the serde middleware, and endpoint resolution time from the endpoint middleware
