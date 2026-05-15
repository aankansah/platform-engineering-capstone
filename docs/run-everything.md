Run everything locally (developer guide)

Prerequisites
- Docker & Docker Compose (v2) installed and running
- Optional (for local development without Docker): Rust toolchain, Java 21+, Node 20+, pnpm

Overview

This repository contains a polyglot microservice demo wired through Kafka. The services are located under `services/`:
- `task-dashboard` (React frontend) — port 3000
- `task-api` (TypeScript API gateway) — port 4000
- `task-validator` (Java Spring Boot) — port 8080
- `task-enricher` (Rust Actix service) — port 8081

We provide a Docker Compose setup at `services/docker-compose.yml` that runs a local Kafka cluster (Zookeeper + Kafka) and all services.

Start everything with Docker Compose

1. From repository root:

```bash
cd services
docker compose up --build
```

2. Wait for services to finish building and start. Kafka will be available at `kafka:9092` inside the compose network and at `localhost:9092` on your host.

Smoke tests

- Frontend: http://localhost:3000
- API: http://localhost:4000 (health: `/health`)  
- Validator: http://localhost:8080 (health: `/actuator/health` or `/health`)  
- Enricher: http://localhost:8081/health and `/ready`

End-to-end message flow (quick)

1. POST a task to the API (this publishes a message to the `tasks` topic):

```bash
curl -X POST http://localhost:4000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"name":"Process Customer Data","priority":"high","description":"desc"}'
```

2. The `task-api` publishes to `tasks`. The `task-validator` consumes `tasks` and publishes a validation event to `events`. The `task-enricher` consumes `tasks`, enriches them, and publishes to `task-events`.

3. You can inspect events by checking logs of the corresponding container or by hitting the API endpoints that expose consumed events (for example `task-api` exposes `/api/events`).

Kafka tools

If you want to inspect topics directly, you can run a consumer from a container that has Kafka client tools. Example using `bitnami/kafka` image's console consumer (run from the compose network):

```bash
# consume from the 'tasks' topic
docker compose exec kafka kafka-console-consumer.sh --bootstrap-server kafka:9092 --topic tasks --from-beginning
```

Notes
- The compose file exposes services on the host; inside containers use the hostname `kafka:9092`.
- If Docker on macOS or Windows rewrites host networking, confirm `localhost:9092` mapping.
