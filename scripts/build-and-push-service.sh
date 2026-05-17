#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "${SCRIPT_DIR}/.env" ]; then
  source "${SCRIPT_DIR}/.env"
fi

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
PROJECT_NAME="${PROJECT_NAME:-ent-aws-capstone}"
PLATFORM="${PLATFORM:-linux/amd64}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_BASE="${ECR_REGISTRY}/${PROJECT_NAME}"

SERVICES=(
  "task-dashboard"
  "task-enricher"
  "task-gateway"
  "task-validator"
)

PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "Project root: ${PROJECT_ROOT}"
echo "ECR base: ${ECR_BASE}"
echo "Platform: ${PLATFORM}"

echo "Logging in to Amazon ECR..."
"${SCRIPT_DIR}/ecr-login.sh"

for SERVICE in "${SERVICES[@]}"; do
  SERVICE_DIR="${PROJECT_ROOT}/services/${SERVICE}"
  IMAGE_URI="${ECR_BASE}/${SERVICE}:latest"

  if [ ! -d "$SERVICE_DIR" ]; then
    echo "Service directory not found: ${SERVICE_DIR}"
    exit 1
  fi

  if [ ! -f "${SERVICE_DIR}/Dockerfile" ]; then
    echo "Dockerfile not found for ${SERVICE}: ${SERVICE_DIR}/Dockerfile"
    exit 1
  fi

  echo "----------------------------------------"
  echo "Building and pushing: ${SERVICE}"
  echo "Image URI: ${IMAGE_URI}"
  echo "Context: ${SERVICE_DIR}"
  echo "----------------------------------------"

  docker buildx build \
    --platform "$PLATFORM" \
    -t "$IMAGE_URI" \
    --push \
    "$SERVICE_DIR"

  echo "${SERVICE} pushed successfully."
done

echo "All images built and pushed successfully."
