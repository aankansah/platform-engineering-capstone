# task-api

TypeScript API gateway that accepts tasks from the frontend and publishes them to Kafka (`tasks` topic). It also consumes `events` from Kafka and exposes them to the frontend.

Environment variables:
- `KAFKA_BROKERS` (comma-separated, default `localhost:9092`)
- `KAFKA_CLIENT_ID` (default `task-api`)
- `KAFKA_GROUP_ID` (default `task-api-group`)
- `PORT` (default `4000`)

Endpoints:
- `POST /api/tasks` — publish JSON payload to `tasks` topic (returns created task with `taskId`)
- `GET /api/events` — list consumed events (in-memory)
- `GET /health` — simple health check

Run locally:

```
cd services/task-api
npm install
npm run build
KAFKA_BROKERS=localhost:9092 npm start
```
