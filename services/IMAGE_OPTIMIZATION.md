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
