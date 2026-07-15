# Image Optimization

Multistage builds were already happening. Image sizes were just too big.

Initial image sizes:

```text
platform-task-dashboard:latest    5d7690826e14     92.6MB     26.1MB   U
platform-task-enricher:latest     dab8e212156b      161MB     34.5MB   U
platform-task-gateway:latest      e4089fe9fc47      291MB     61.5MB   U
platform-task-validator:latest    cc51f76c51d2      375MB      117MB   U
```

## Dashboard App

React/Vite build assets in `services/task-dashboard/dist` were about **404K**.

The **92.6MB** image was mostly `nginx:alpine`, not the React/Vite app.

### Optimization

Switched from:

```dockerfile
FROM nginx:alpine
```

to:

```dockerfile
FROM nginx:mainline-alpine-slim
```

### Result

```text
platform-task-dashboard:latest    32eb98bf57df      22MB     6.28MB
```

Dashboard image size reduced from **92.6MB** to **22MB**.

## Gateway Service

The gateway app build output is small. The image size was mostly from the Node base image and runtime dependencies.

### Optimization

Switched from installing/copying runtime `node_modules`:

```dockerfile
RUN npm install
COPY --from=builder /app/node_modules ./node_modules
```

to bundling the app with `esbuild` and copying only `dist`:

```dockerfile
RUN pnpm build
COPY --from=builder /app/dist ./dist
```

Build script:

```json
"build": "tsc -p tsconfig.json --noEmit && esbuild src/index.ts --bundle --platform=node --target=node20 --format=cjs --outfile=dist/index.js"
```

Also pinned the base image:

```dockerfile
FROM node:20-alpine3.20
```

### Result

```text
platform-task-gateway:latest      b12c444cc387      194MB     48.5MB   U
```

Gateway image size reduced from **291MB** to **194MB** after bundling.

## Validator Service

The validator is a Spring Boot Java service. The image size was mostly from the Java runtime and Spring/Kafka dependencies.

### Optimization

Switched from the full Temurin JRE runtime image:

```dockerfile
FROM eclipse-temurin:21-jre-alpine
```

to Alpine with a custom Java runtime built using `jlink`:

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS runtime
RUN jlink \
    --add-modules java.base,java.desktop,java.instrument,java.logging,java.management,java.naming,java.net.http,java.security.jgss,java.sql,java.xml,jdk.crypto.ec,jdk.management,jdk.unsupported \
    --strip-debug \
    --no-header-files \
    --no-man-pages \
    --compress=2 \
    --output /opt/java-runtime

FROM alpine:3.20
COPY --from=runtime /opt/java-runtime /opt/java-runtime
```

Also added `.dockerignore` to reduce build context.

### Result

```text
platform-task-validator:latest       a566d57dd745      375MB      117MB   U
platform-task-validator:jlink-test   738d26d36c12      202MB       86MB
```

Validator image size reduced from **375MB** to **202MB** with the custom `jlink` runtime.

## Enricher Service

The enricher is a Rust (Actix) service that consumes `tasks`, enriches them, and publishes `task-events`.

### Optimization

Switched from a single-stage image that bundled the Rust toolchain and build artifacts (large final image):

```dockerfile
# previous (single-stage)
FROM rust:1-bookworm
WORKDIR /usr/src/task-enricher
COPY . .
RUN cargo build --release
CMD ["/usr/src/task-enricher/target/release/task-enricher"]
```

To a multi-stage build that compiles a release binary in a builder stage and copies only the stripped binary into a minimal distroless runtime:

```dockerfile
FROM rust:1-bookworm AS builder
WORKDIR /usr/src/task-enricher
RUN apt-get update && apt-get install -y --no-install-recommends cmake && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release --locked && strip target/release/task-enricher

FROM gcr.io/distroless/cc-debian12:nonroot
COPY --from=builder /usr/lib/*/libz.so.1* /usr/local/lib/
COPY --from=builder /usr/src/task-enricher/target/release/task-enricher /usr/local/bin/task-enricher
EXPOSE 8080
CMD ["/usr/local/bin/task-enricher"]
```

Other targeted changes:
- Install native build dependencies (e.g. `cmake`) only in the builder stage.
- Strip the release binary to remove debug symbols.
- Add `dotenv` for local development and `Settings::from_env()` for runtime config.
- Add a `/ready` readiness endpoint that verifies Kafka connectivity before marking the service ready.

### Result

```text
platform-task-enricher:latest                                                            641ce32de888       53.5MB         10.8MB   U
```

Enricher image reduced from ~161MB to ~53.5MB after switching to a multi-stage, stripped binary + distroless runtime.

### Final sizes (current)

```text
platform-task-dashboard:latest                                                           6863f6d46b13         22MB         6.28MB   U
platform-task-enricher:latest                                                            641ce32de888       53.5MB         10.8MB   U
platform-task-gateway:latest                                                             60f8adfd8c19        194MB         48.5MB   U
platform-task-validator:latest                                                           5ecb76debea5        202MB           86MB   U
```

### Learnings & Recommendations

- Image size impacts developer and platform workflows: larger images increase CI/CD transfer times, storage usage in registries, and node pull/start times on Kubernetes which slows deployments and can delay rollouts.
- Smaller images improve iteration speed (faster CI jobs, quicker deployment), reduce attack surface, and lower resource costs on container hosts.
- Recommended strategies:
    - Use multi-stage builds to keep build-time toolchains out of runtime images.
    - Pin base images and only install native build deps in builder stages.
    - Bundle or tree-shake application code (esbuild/webpack) and copy only artifacts needed at runtime.
    - Strip binaries and remove debug symbols for native languages.
    - Prefer minimal runtime images (distroless, alpine-slim) where compatible.
    - Use build cache, layer ordering, and `.dockerignore` to avoid rebuilding unnecessary layers and to reduce context size.
    - Use incremental/delta pushes and a fast registry (and CI caching) to speed up CI/CD.
    - Run automated image-size checks in CI and fail or warn when thresholds are exceeded.

Keep this section as the canonical final size and recommendations for the repo.
