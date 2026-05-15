# task-enricher


Rust microservice that consumes `tasks`, enriches them, and publishes enriched events to `task-events`.

This README explains how to build, run, test, and debug the enricher locally and with Docker.

Build & Run (local)

Prerequisites: Rust toolchain (rustup + cargo)

```bash
cd services/task-enricher
cargo build --release
# set the broker URL to a reachable Kafka instance
KAFKA_BROKERS=localhost:9092 ./target/release/task-enricher
```

Run tests

```bash
cd services/task-enricher
cargo test
```

Docker

Build the image:

```bash
docker build -t platform-task-enricher:latest services/task-enricher
```

Run the container (pointing at a Kafka broker):

```bash
docker run -e KAFKA_BROKERS=localhost:9092 -p 8080:8080 platform-task-enricher:latest
```

Health & Readiness

- `/health` — liveness endpoint; returns 200 when the process is up.
- `/ready` — readiness endpoint: attempts a short TCP connect to the first broker listed in the `KAFKA_BROKERS` environment variable (1s timeout). If it can connect, the service returns 200. Use this in Kubernetes readiness probes to avoid routing traffic to a service that cannot reach Kafka.

Debugging tips

- Logs: the service uses `tracing` — check stdout logs from the container for consumer/producer errors.
- Kafka inspection: use the provided `services/docker-compose.yml` to run a local Kafka and use the console consumer to inspect topics.

