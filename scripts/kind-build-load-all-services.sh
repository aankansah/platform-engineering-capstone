#!/usr/bin/env bash
set -euo pipefail

KIND_CLUSTER_NAME="${KIND_CLUSTER_NAME:-ent-aws-capstone-local}"

SERVICES=(
  "task-dashboard"
  "task-gateway"
  "task-validator"
  "task-enricher"
)

for SERVICE in "${SERVICES[@]}"; do
  echo "Building ${SERVICE}:local..."

  docker build \
    -t "${SERVICE}:local" \
    "../services/${SERVICE}"

  echo "Loading ${SERVICE}:local into kind cluster..."

  kind load docker-image "${SERVICE}:local" \
    --name "${KIND_CLUSTER_NAME}"

  echo "${SERVICE}:local loaded."
done

echo "All local images built and loaded into kind."