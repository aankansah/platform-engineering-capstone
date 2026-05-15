## Services Overview

### task-dashboard

The user-facing web application where users submit tasks and view the real-time processing timeline.

### task-api

The central API service that accepts task submissions, publishes tasks to Kafka, and exposes processing events to the frontend.

### task-validator

A validation service that consumes tasks from Kafka, performs basic checks, and emits validation events.

### task-enricher

An enrichment service that consumes tasks from Kafka, adds additional metadata, and emits enrichment events.

### Apache Kafka

The message broker that enables asynchronous communication between the microservices.

---

## Technology Mapping

| Service            | Technology                               | Responsibility                                                 |
| ------------------ | ---------------------------------------- | -------------------------------------------------------------- |
| `task-dashboard` | React + TypeScript + Vite                | Frontend UI for submitting tasks and viewing processing events |
| `task-api`       | Node.js + TypeScript + Express + KafkaJS | REST API, Kafka producer, and event aggregator                 |
| `task-validator` | Java + Spring Boot + Spring Kafka        | Consumes tasks and validates them                              |
| `task-enricher`  | Rust + Tokio + rdkafka                   | Consumes tasks and enriches them                               |
| `Apache Kafka`   | Apache Kafka                             | Message broker for asynchronous communication                  |

---

## Kafka Topics

| Topic           | Purpose                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `tasks`       | Carries newly submitted tasks from `task-api` to downstream processors      |
| `task-events` | Carries processing events emitted by `task-validator` and `task-enricher` |

## Data Flow

The Polyglot Task Pipeline is a simple event-driven application that demonstrates how multiple microservices written in different programming languages communicate through Apache Kafka.

### Data Flow (Simple)

- The user submits a task from the `task-dashboard` web application by providing a task name, priority, and description.
- The `task-dashboard` sends the request to `POST /api/tasks` exposed by the `task-gateway` service.
- The `task-gateway` service generates a unique `taskId` and publishes the task message to the Kafka topic `tasks`.
- The `task-validator` service (built with Java and Spring Boot) consumes messages from the `tasks` topic, performs basic validation, and publishes a validation event to the Kafka topic `task-events`.
- The `task-enricher` service (built with Rust) also consumes messages from the `tasks` topic, adds additional metadata to the task, and publishes an enrichment event to the Kafka topic `task-events`.
- The `task-gateway` service consumes messages from the `task-events` topic and stores them in memory.
- The `task-dashboard` periodically calls `GET /api/events` exposed by `task-gateway` to retrieve the latest processing events.
- The user sees a processing timeline in the dashboard showing each step completed by the downstream services.

### Example Processing Timeline

1. Task submitted from dashboard
2. Task published to Kafka topic `tasks`
3. Task Validator validated task
4. Task Enricher enriched task
5. Processing complete

This document is intentionally written in plain language to illustrate how data moves through the system from the user interface, through Kafka, across multiple services, and back to the frontend.
