Task Validator — Technical Guide

Purpose
- Java Spring Boot service that consumes `tasks` from Kafka, validates them, and publishes validation events to `events`.

Build & Run (locally)

Requirements: Java 21+, Maven

```bash
cd services/task-validator
./mvnw -DskipTests package
./mvnw spring-boot:run
```

Docker

```bash
docker build -t platform-task-validator:latest services/task-validator
docker run -e KAFKA_BROKERS=localhost:9092 -p 8080:8080 platform-task-validator:latest
```

Health & Actuator
- Spring Boot actuator endpoints are enabled; use `/actuator/health` for health. The service also exposes a simple liveness endpoint.

Testing
- Unit and integration tests use Spring's `EmbeddedKafka` for broker-less tests: `./mvnw test`

Code layout
- `src/main/java/.../service/TaskProcessor.java` — Kafka listener and publisher
- `src/main/resources/application.properties` — Kafka configuration and topic names

Readiness
- In Kubernetes, prefer adding a readiness probe that checks connectivity to Kafka (similar to the enricher readiness). The `TaskProcessor` logs events it creates; the readiness probe can be implemented by attempting to access broker metadata.

Debugging
- Use `docker logs` or `mvn spring-boot:run` output to inspect message processing.
- Tests run against an embedded Kafka instance for CI.
