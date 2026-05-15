# Frontend App

React + TypeScript dashboard for the polyglot task-processing workflow.

## Features

- Submit task payloads to the TypeScript API
- Display Kafka-backed processing events as a timeline
- Poll `/api/events` every 2 seconds
- Tailwind CSS styling through the Vite Tailwind plugin
- Static `/healthz` endpoint for Kubernetes probes

## Local Development

Install dependencies:

```sh
pnpm install
```

Run the Vite dev server:

```sh
pnpm dev
```

Run tests

```sh
pnpm install
npm test
```

Build the production bundle:

```sh
pnpm build
```

Lint the app:

```sh
pnpm lint
```

## Environment Configuration

The app uses `.env` for Vite environment variables. Copy `.env.example` when
creating a new local environment:

```sh
cp .env.example .env
```

Current variables:

```txt
VITE_API_BASE_URL=/api
VITE_EVENTS_REFRESH_INTERVAL_MS=2000
```

Environment values are read once in `src/config/constants.ts` and exported as
application constants:

```txt
API_BASE_URL
EVENTS_REFRESH_INTERVAL_MS
```

Expected backend routes:

- `POST /api/tasks`
- `GET /api/events`

For local development, Vite proxies `/api` to `http://localhost:4000`.
In Docker, nginx proxies `/api` to `http://task-gateway:4000` on the Compose
network.

## Project Structure

```txt
src/
  api/
    queries/
      events.ts
      tasks.ts
  components/
    AppHeader.tsx
    AppSidebar.tsx
    ProjectInfoFab.tsx
    ProjectInfoModal.tsx
    StackShowcase.tsx
    TaskForm.tsx
    Timeline.tsx
    TimelineItem.tsx
    WelcomeAlert.tsx
  hooks/
    useCreateTaskMutation.ts
    useEventsQuery.ts
    useTaskDashboard.ts
  config/
    constants.ts
  App.tsx
  main.tsx
  types.ts
```

Request functions live in `src/api/queries/` and are split by backend resource.
React hooks live in `src/hooks/`; request-specific hooks wrap individual API
calls, while `useTaskDashboard` composes the page state. Environment variables
are pulled into `src/config/constants.ts` and consumed through exported
constants.

## Kubernetes Health Checks

For a static frontend, the usual Kubernetes liveness/readiness probe is an HTTP
GET against a lightweight static file served by the frontend container. This app
includes `public/healthz`, which is copied into `dist/healthz` during build and
should return `200 OK` when the web server is serving the frontend.

Example probe configuration:

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: http
  initialDelaySeconds: 10
  periodSeconds: 20
readinessProbe:
  httpGet:
    path: /healthz
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10
```

API and Kafka dependency health should be checked by the backend services, not by
the static frontend container.
