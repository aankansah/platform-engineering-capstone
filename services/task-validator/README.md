# task-validator (Java service)

Spring Boot service that consumes from Kafka `tasks` topic and publishes validation events to `task-events` topic.

How it works (simple):
- Listens for messages on Kafka topic `tasks`.
- Validates that each task has `taskId`, `name`, `description`, and a `priority` of `low`, `medium`, or `high`.
- For each task, it emits a JSON event to `task-events` with `taskId`, `service`, `status`, `message`, `timestamp`, `priority`, `valid`, and `validationErrors`.

Run locally (requires Kafka at localhost:9092):

Prerequisites: Java 21+, Maven

```bash
cd services/task-validator
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Local configuration is handled through Spring Boot properties, not a service
`.env` file. Defaults live in `src/main/resources/application.properties`; local
developer overrides can live in `src/main/resources/application-local.properties`
and be enabled with:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Container and Kubernetes deployments should continue passing runtime settings as
environment variables, ConfigMaps, Secrets, or Helm values.

Build & Docker

```bash
cd services/task-validator
./mvnw -DskipTests package
docker build -t platform-task-validator:latest services/task-validator
docker run -e KAFKA_BROKERS=localhost:9092 -p 8081:8080 platform-task-validator:latest
```

Health & Readiness

- Actuator: `/actuator/health` for detailed health information.
- In Kubernetes, add a readiness probe that confirms Kafka connectivity before marking the pod ready.

Testing

- Run unit & integration tests (EmbeddedKafka):

```bash
cd services/task-validator
./mvnw test
```
