# task-gateway

TypeScript API gateway that accepts tasks from the frontend and publishes them to Kafka (`tasks` topic). It also consumes `task-events` from Kafka and exposes them to the frontend.

Environment variables:
- `KAFKA_BROKERS` (comma-separated, default `localhost:9092`)
- `KAFKA_CLIENT_ID` (default `task-gateway`)
- `KAFKA_GROUP_ID` (default `task-gateway-group`)
- `TOPIC_TASKS` (default `tasks`)
- `TOPIC_TASK_EVENTS` (default `task-events`)
- `PORT` (default `4000`)

Endpoints:
- `POST /api/tasks` — publish JSON payload to `tasks` topic (returns created task with `taskId`)
- `GET /api/events` — list consumed events (in-memory)
- `GET /health` — simple health check

Run locally:

```
cd services/task-gateway
npm install
npm run build
KAFKA_BROKERS=localhost:29092 npm start
```

Development

```bash
cd services/task-gateway
npm install
npm run dev
```

Run tests

```bash
npm test
```

Docker

```bash
docker build -t platform-task-gateway:latest services/task-gateway
docker run -e KAFKA_BROKERS=localhost:29092 -p 4000:4000 platform-task-gateway:latest
```
