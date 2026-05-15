Task Enricher — Technical Guide

Purpose
- Consumes `tasks` messages from Kafka, enriches payload with metadata, publishes enriched events to `task-events`.
- Enrichment events include `taskId`, `service`, `status`, `message`, `timestamp`, `priority`, `category`, `enrichedBy`, and `metadata`.

Build & Run (locally)

Requirements: Rust toolchain (rustup/cargo)

```bash
cd services/task-enricher
cargo build --release
KAFKA_BROKERS=localhost:9092 ./target/release/task-enricher
```

Docker

```bash
docker build -t platform-task-enricher:latest services/task-enricher
docker run -e KAFKA_BROKERS=localhost:9092 -p 8080:8080 platform-task-enricher:latest
```

Health & Readiness
- `/health` — simple liveness check; returns 200 if process is up.
- `/ready` — readiness probe: attempts a TCP connection to the first broker listed in `KAFKA_BROKERS` within a 1s timeout. If it can connect, the service returns 200 and is considered ready.

Why readiness matters
- Kubernetes uses liveness probes to restart unhealthy containers and readiness probes to stop sending traffic to pods that are not ready. The enricher's readiness makes sure it only receives traffic (or is considered ready by orchestrators) when it can reach Kafka. This avoids accepting traffic when downstream infrastructure (Kafka) is unreachable.

Configuration
- `KAFKA_BROKERS` — comma-separated list of broker addresses (default: `localhost:9092`)
- `CONSUMER_GROUP` — consumer group id (default: `task-enricher-group`)
- `TOPIC_TASKS` — task input topic (default: `tasks`)
- `TOPIC_TASK_EVENTS` — processing event output topic (default: `task-events`)
- `LISTEN_ADDR` — HTTP listen address (default: `0.0.0.0:8080`)

Testing
- Unit tests: `cargo test` (includes enrichment unit tests)

Code layout
- `src/main.rs` — application entrypoint and HTTP server
- `src/config.rs` — basic env config
- `src/kafka/consumer.rs` — Kafka consumer (rdkafka StreamConsumer)
- `src/kafka/producer.rs` — Kafka producer helper
- `src/services/enrichment.rs` — enrichment logic (unit-tested)
- `src/handlers/health.rs` — health/readiness endpoints

Debugging
- Check container logs for parsing or publish errors.
- Use Kafka CLI tools to inspect topics and messages.
