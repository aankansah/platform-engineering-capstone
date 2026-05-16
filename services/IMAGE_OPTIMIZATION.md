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

