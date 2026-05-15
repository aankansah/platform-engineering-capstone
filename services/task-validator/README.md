# task-validator (Java service)

Spring Boot service that consumes from Kafka `tasks` topic and publishes validation events to `events` topic.

How it works (simple):
- Listens for messages on Kafka topic `tasks`.
- For each task, it emits a JSON event to `events` with `taskId`, `service`, and `message`.

Run locally (requires Kafka at localhost:9092):

```
cd services/task-validator
./mvnw spring-boot:run
```

Docker:

```
docker build -t platform-task-validator:latest services/task-validator
docker run -e KAFKA_BROKERS=localhost:9092 -p 8080:8080 platform-task-validator:latest
```
