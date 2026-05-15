# task-enricher

Rust microservice that consumes `tasks`, enriches them, and publishes enriched events to `task-events`.

Quick run (requires Kafka accessible at `localhost:9092`):

```
cd services/task-enricher
cargo build --release
KAFKA_BROKERS=localhost:9092 ./target/release/task-enricher
```

Docker:

```
docker build -t platform-task-enricher:latest services/task-enricher
docker run -e KAFKA_BROKERS=localhost:9092 -p 8080:8080 platform-task-enricher:latest
```
