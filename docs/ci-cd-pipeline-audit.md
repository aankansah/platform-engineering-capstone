# CI/CD Pipeline Audit

Last reviewed: 2026-07-15

This document audits the GitHub Actions CI/CD workflows in `.github/workflows`.
It describes what each workflow does, how workflows are triggered, what each job
validates, and the operational/security findings to track.

## Workflow Inventory

| Workflow | File | Trigger | Purpose |
| --- | --- | --- | --- |
| CI — Build & Test All Services | `.github/workflows/ci-build.yml` | Push to `develop`, `staging`, `main`; pull request to `main` | Build, test, lint, and publish service images |
| Deploy | `.github/workflows/deploy.yml` | `workflow_run` after CI completes on `develop`, `staging`, or `main` | Run security scans, then deploy the matching environment |
| Security Scanning — Tiered | `.github/workflows/security-scanning.yml` | `workflow_call` only | Reusable tiered security scanning workflow called by Deploy |
| Test OIDC Authentication | `.github/workflows/test-oidc.yaml` | Manual `workflow_dispatch` | Validate GitHub Actions OIDC access to AWS |
| Nightly Dev Cleanup | `.github/workflows/nightly-cleanup.yml` | Nightly schedule and manual `workflow_dispatch` | Destroy the dev Terraform environment to reduce cost |

## End-to-End Flow

1. A commit is pushed to `develop`, `staging`, or `main`, or a pull request targets `main`.
2. `CI — Build & Test All Services` runs.
3. On push events, CI builds and pushes Docker images tagged with the commit SHA and `latest`.
4. When CI completes successfully on `develop`, `staging`, or `main`, `Deploy` is triggered by `workflow_run`.
5. `Deploy` first calls the reusable `Security Scanning — Tiered` workflow.
6. If security scanning succeeds, deployment proceeds according to the CI branch:
   - `develop` deploys to `dev`.
   - `staging` deploys to `staging`.
   - `main` deploys to `production`.

Important GitHub Actions behavior: a `workflow_run` listener must exist on the repository default branch to trigger automatically. If `deploy.yml` exists only on `develop`, successful CI runs on `develop` will not start Deploy until `deploy.yml` is also present on the default branch.

## CI — Build & Test All Services

File: `.github/workflows/ci-build.yml`

### Trigger

Runs on:

- Push to `develop`, `staging`, or `main`.
- Pull request targeting `main`.

### Permissions

```yaml
permissions:
  id-token: write
  contents: read
```

`id-token: write` is required for AWS OIDC authentication when images are pushed on branch pushes.

### Global Environment

| Variable | Value | Purpose |
| --- | --- | --- |
| `AWS_REGION` | `us-east-1` | AWS region used for ECR authentication |
| `ECR_REPOSITORY_PREFIX` | `ent-aws-capstone` | Prefix for ECR repositories |

### Job: Detect Changed Services

Purpose: Uses `dorny/paths-filter@v3` to determine which services or deployment assets changed.

Outputs:

- `task_dashboard`
- `task_gateway`
- `task_validator`
- `task_enricher`
- `deploy_all`

Validation performed:

- Confirms the repository has been checked out.
- Computes change scope for service-specific CI optimization.

Audit note:

- On `push`, each service build job runs regardless of path filter because the job condition includes `github.event_name == 'push'`.
- On pull requests, service jobs run only if their service changed or deployment/workflow assets changed.

### Job: Build Task Dashboard

Working directory: `services/task-dashboard`

Runtime/tooling:

- pnpm `10.15.0`
- Node.js `20`

Steps and validations:

1. Checkout repository.
2. Install pnpm.
3. Install Node.js and enable pnpm lockfile cache.
4. Install dependencies with `pnpm install --frozen-lockfile`.
   - Validates dependency installation is reproducible from `pnpm-lock.yaml`.
5. Run linter with `pnpm run lint`.
   - Validates ESLint rules and React hook linting.
6. Run tests with `pnpm test`.
   - Validates Vitest unit tests.
7. Build app with `pnpm build`.
   - Validates TypeScript build and Vite production bundle.
8. On push only, configure AWS credentials through OIDC.
9. On push only, log in to Amazon ECR.
10. On push only, build and push Docker image tags:
    - `${github.sha}`
    - `latest`

Deployment artifact:

- ECR image: `ent-aws-capstone/task-dashboard`

### Job: Build Task Gateway

Working directory: `services/task-gateway`

Runtime/tooling:

- pnpm `10.15.0`
- Node.js `20`

Steps and validations:

1. Checkout repository.
2. Install pnpm.
3. Install Node.js and enable pnpm lockfile cache.
4. Install dependencies with `pnpm install --frozen-lockfile`.
5. Run optional lint script with `pnpm run --if-present lint`.
   - Avoids failure when `lint` is not defined.
6. Run tests with `pnpm test`.
   - Validates Jest test suite.
7. Build app with `pnpm build`.
   - Validates TypeScript type check and bundled Node build.
8. On push only, configure AWS credentials through OIDC.
9. On push only, log in to Amazon ECR.
10. On push only, build and push Docker image tags:
    - `${github.sha}`
    - `latest`

Deployment artifact:

- ECR image: `ent-aws-capstone/task-gateway`

### Job: Build Task Validator

Working directory: `services/task-validator`

Runtime/tooling:

- Java `21`
- Maven cache enabled through `actions/setup-java@v4`

Steps and validations:

1. Checkout repository.
2. Install Java 21 from Temurin.
3. Run `mvn clean verify -q`.
   - Validates compilation.
   - Runs unit/integration tests configured in Maven.
   - Runs Maven verification lifecycle checks.
4. On push only, configure AWS credentials through OIDC.
5. On push only, log in to Amazon ECR.
6. On push only, build and push Docker image tags:
   - `${github.sha}`
   - `latest`

Deployment artifact:

- ECR image: `ent-aws-capstone/task-validator`

### Job: Build Task Enricher

Working directory: `services/task-enricher`

Runtime/tooling:

- Stable Rust toolchain
- Cargo cache
- Native build dependencies: `cmake`, `libcurl4-openssl-dev`

Steps and validations:

1. Checkout repository.
2. Install Rust stable.
3. Install native dependencies.
   - Required by `rdkafka-sys`/librdkafka builds.
4. Cache Cargo registry, Cargo git sources, and `target`.
5. Run `cargo test`.
   - Validates Rust tests.
6. Run `cargo clippy --all-targets -- -D warnings`.
   - Treats Clippy warnings as failures.
7. On push only, configure AWS credentials through OIDC.
8. On push only, log in to Amazon ECR.
9. On push only, build and push Docker image tags:
   - `${github.sha}`
   - `latest`

Deployment artifact:

- ECR image: `ent-aws-capstone/task-enricher`

## Deploy

File: `.github/workflows/deploy.yml`

### Trigger

Runs on `workflow_run` completion for:

```yaml
workflows: ["CI — Build & Test All Services"]
branches: [develop, staging, main]
types: [completed]
```

Deploy jobs are additionally gated with:

```yaml
github.event.workflow_run.conclusion == 'success'
```

### Permissions

```yaml
permissions:
  id-token: write
  contents: read
  security-events: write
  actions: read
```

`id-token: write` is required for AWS OIDC authentication. `security-events: write` supports security scan integrations that may publish security results.

### Global Environment

| Variable | Value | Purpose |
| --- | --- | --- |
| `AWS_REGION` | `us-east-1` | AWS region for deployment |
| `ECR_REGISTRY` | `${{ secrets.ECR_REGISTRY }}` | ECR registry host |
| `ECR_REPOSITORY_PREFIX` | `ent-aws-capstone` | ECR repository prefix |
| `IMAGE_TAG` | `${{ github.event.workflow_run.head_sha }}` | Image tag matching the CI commit SHA |

### Job: Run Security Scanning

Calls `.github/workflows/security-scanning.yml` with:

```yaml
branch: refs/heads/${{ github.event.workflow_run.head_branch }}
```

Validation performed:

- Ensures the branch receives the correct scan tier.
- Blocks deployment if the reusable security workflow fails.

### Job: Deploy to Dev

Runs when:

```yaml
github.event.workflow_run.head_branch == 'develop'
```

Steps and validations:

1. Checkout repository at the exact CI commit SHA.
2. Configure AWS credentials through OIDC.
3. Install Helm.
4. Install kubectl.
5. Update kubeconfig for EKS cluster `ent-aws-capstone-dev`.
6. Run `helm upgrade --install` for release `microservices-dev`.
   - Namespace: `dev`
   - Values file: `helm/microservices/values.dev.yaml`
   - Image tags: CI commit SHA.
   - Timeout: 10 minutes.
7. Verify rollout status for all four deployments in namespace `dev`.

Validation focus:

- Confirms manifests can be applied with Helm.
- Confirms all service deployments roll out successfully.

### Job: Deploy to Staging

Runs when:

```yaml
github.event.workflow_run.head_branch == 'staging'
```

Steps and validations:

1. Checkout repository at the exact CI commit SHA.
2. Configure AWS credentials through OIDC.
3. Install Helm.
4. Install kubectl.
5. Update kubeconfig for EKS cluster `ent-aws-capstone-staging`.
6. Run `helm upgrade --install` for release `microservices-staging`.
   - Namespace: `staging`
   - Values file: `helm/microservices/values.staging.yaml`
   - Image tags: CI commit SHA.
   - Timeout: 15 minutes.
7. Verify rollout status for all four deployments in namespace `staging`.

Validation focus:

- Confirms staging environment can consume the exact images built by CI.
- Confirms all staging deployments roll out.

### Job: Deploy to Production

Runs when:

```yaml
github.event.workflow_run.head_branch == 'main'
```

Steps and validations:

1. Checkout repository at the exact CI commit SHA.
2. Configure AWS credentials through OIDC.
3. Install Helm.
4. Install kubectl.
5. Update kubeconfig for EKS cluster `ent-aws-capstone-production`.
6. Run `helm upgrade --install` for release `microservices-production`.
   - Namespace: `production`
   - Values file: `helm/microservices/values.production.yaml`
   - Image tags: CI commit SHA.
   - Timeout: 20 minutes.
   - Uses `--atomic`, so Helm rolls back on failure.
7. Verify rollout status for all four deployments in namespace `production`.
8. Run production smoke test:
   - Waits 30 seconds.
   - Calls `https://yourapp.example.com/health`.

Validation focus:

- Confirms production release succeeds or rolls back atomically.
- Confirms production workloads roll out.
- Confirms a public health endpoint responds successfully.

Audit note:

- Production smoke test URL is still a placeholder (`yourapp.example.com`). Replace it with the real production endpoint before relying on this gate.

## Security Scanning — Tiered

File: `.github/workflows/security-scanning.yml`

### Trigger

This workflow is reusable only:

```yaml
on:
  workflow_call:
```

It does not run directly from push, pull request, or manual dispatch. It is called by `deploy.yml`.

### Scan Tier Logic

The `determine-level` job maps branch to scan level:

| Branch ref | Level | Fast | Comprehensive | Full |
| --- | --- | --- | --- | --- |
| `refs/heads/main` | `full` | Yes | Yes | Yes |
| `refs/heads/staging` | `comprehensive` | Yes | Yes | No |
| Any other branch | `fast` | Yes | No | No |

In the current deploy flow, this means:

- `develop` runs fast scans.
- `staging` runs fast and comprehensive scans.
- `main` runs fast, comprehensive, and full scans.

### Job: Determine Scan Level

Purpose:

- Reads the branch input from the caller.
- Emits outputs used to decide which scan jobs run.

Validation performed:

- Confirms branch-to-tier mapping.

### Job: Fast Security Scans

Runs when `run_fast == true`.

Steps and validations:

1. Checkout repository with full history (`fetch-depth: 0`).
2. Secret scan with Gitleaks CLI in Docker.
   - Scans the repository for committed secrets.
   - Uses `--redact` so findings do not expose secrets in logs.
3. Dependency scan for `task-dashboard` with Trivy filesystem scanner.
   - Scans dependency manifests/lockfiles.
   - Fails on fixed CRITICAL vulnerabilities.
   - Ignores unfixed vulnerabilities.
4. Dependency scan for `task-gateway` with Trivy filesystem scanner.
   - Same behavior as dashboard scan.
5. Setup Rust.
6. Run `cargo install cargo-audit` and `cargo audit` for `task-enricher`.
   - Validates Rust dependency advisory status.

Validation focus:

- Secrets in git history and working tree.
- Critical Node dependency vulnerabilities.
- Rust dependency advisories.

### Job: Comprehensive Security Scans

Runs when `run_comprehensive == true`.

Steps and validations:

1. Checkout repository.
2. SAST with Semgrep using:
   - `p/security-audit`
   - `p/owasp-top-ten`
   - `p/nodejs`
   - `p/java`
   - `p/rust`
3. Dependency scan for `task-dashboard` with Trivy filesystem scanner.
4. Dependency scan for `task-gateway` with Trivy filesystem scanner.
5. Dependency scan for `task-validator` with Trivy filesystem scanner.
6. Terraform IaC scanning with Checkov.
   - Scans `terraform/`.
   - Produces CLI and JUnit XML output.
   - Uses `--soft-fail`, so findings do not fail the job.
7. Terraform IaC scanning with tfsec.
   - Scans `terraform/`.
   - Uses `soft_fail: true`, so findings do not fail the job.
8. Upload scan artifacts.
   - Checkov JUnit XML results.

Validation focus:

- Source-level security patterns.
- Node dependency critical vulnerabilities.
- Java dependency critical vulnerabilities.
- Terraform security posture.

Audit note:

- Checkov and tfsec are currently soft-fail. They provide visibility but do not block deploys.

### Job: Full Security Scans

Runs when `run_full == true`.

Steps and validations:

1. Checkout repository.
2. Build Docker image for `task-dashboard`.
3. Scan dashboard image with Trivy.
4. Build Docker image for `task-gateway`.
5. Scan gateway image with Trivy.
6. Build Docker image for `task-validator`.
7. Scan validator image with Trivy.
8. Build Docker image for `task-enricher`.
9. Scan enricher image with Trivy.
10. Generate `security-report.md`.
11. Upload production security report artifact.

Validation focus:

- Container image operating system/package vulnerabilities.
- Runtime image vulnerability posture before production deployment.

Current gate behavior:

- Trivy image scans report HIGH and CRITICAL findings.
- `ignore-unfixed: true` is enabled.
- `exit-code: "0"` is configured, so image findings do not block deployment.

Audit note:

- This is a visibility-first setting. If production should be blocked on CRITICAL image vulnerabilities, set `exit-code: "1"` for production scans after base images are remediated or allowlisted.

### Job: Security Scan Summary

Runs with `if: always()`.

Purpose:

- Prints scan level and job results.
- Fails if any enabled scan job failed.

Validation performed:

- Enforces the security scan result as a deployment gate.

## Test OIDC Authentication

File: `.github/workflows/test-oidc.yaml`

### Trigger

Manual only:

```yaml
on:
  workflow_dispatch:
```

### Permissions

```yaml
permissions:
  id-token: write
  contents: read
```

### Job: Test AWS Auth

Steps and validations:

1. Checkout repository.
2. Configure AWS credentials using `${{ secrets.AWS_ROLE_ARN }}`.
3. Run `aws sts get-caller-identity`.

Validation focus:

- Confirms GitHub Actions can request an OIDC token.
- Confirms AWS role trust policy permits this repository/branch context.
- Confirms the assumed role identity is usable from GitHub Actions.

## Nightly Dev Cleanup

File: `.github/workflows/nightly-cleanup.yml`

### Trigger

Runs:

- Every day at 02:00 UTC.
- Manually through `workflow_dispatch`.

### Permissions

```yaml
permissions:
  id-token: write
  contents: read
```

### Job: Destroy Dev Environment

Steps and validations:

1. Checkout repository.
2. Configure AWS credentials through OIDC.
3. Install Terraform `1.5.7`.
4. Run `terraform init` in `terraform/environments/dev`.
5. Run `terraform destroy -auto-approve`.

Validation focus:

- Confirms dev Terraform backend initializes.
- Confirms dev infrastructure can be destroyed automatically.

Operational note:

- This workflow is intentionally destructive. The schedule should be enabled only if the team expects dev infrastructure to be ephemeral.

## Environment Promotion Model

| Branch | CI | Security tier | Deployment target | Helm values |
| --- | --- | --- | --- | --- |
| `develop` | Build/test/push all services | Fast | `dev` | `helm/microservices/values.dev.yaml` |
| `staging` | Build/test/push all services | Comprehensive | `staging` | `helm/microservices/values.staging.yaml` |
| `main` | Build/test/push all services | Full | `production` | `helm/microservices/values.production.yaml` |

Images are tagged with the CI commit SHA and deployed by that exact SHA:

```yaml
IMAGE_TAG: ${{ github.event.workflow_run.head_sha }}
```

This gives traceability from deployed Kubernetes workload back to the CI run and git commit.

## Secrets and External Dependencies

Required GitHub secrets:

| Secret | Used by | Purpose |
| --- | --- | --- |
| `AWS_ROLE_ARN` | CI, Deploy, Test OIDC, Nightly Cleanup | AWS role assumed through GitHub OIDC |
| `ECR_REGISTRY` | Deploy | Registry host used in Helm image repository values |
| `GITHUB_TOKEN` | GitHub-provided token | Used implicitly by checkout/actions and by GitHub Actions runtime |

External services/tools:

- AWS STS/OIDC
- Amazon ECR
- Amazon EKS
- GitHub Actions hosted Ubuntu runners
- Docker Hub / GHCR / action registries
- Maven Central and npm/pnpm registries
- Semgrep rulesets
- Trivy vulnerability database
- Checkov and tfsec security rules
- Cargo registry and RustSec advisory database

## Audit Findings

### Finding 1: Deploy workflow must exist on default branch

Severity: High

`deploy.yml` uses `workflow_run`. GitHub evaluates `workflow_run` listener workflows from the repository default branch. If `deploy.yml` and its reusable security workflow are not present on the default branch, successful CI runs on `develop`/`staging`/`main` will not trigger Deploy.

Recommendation:

- Keep `.github/workflows/deploy.yml` and `.github/workflows/security-scanning.yml` merged to the default branch.
- After merging workflow changes to the default branch, rerun or push a new CI run on the target branch.

### Finding 2: CI push builds every service regardless of changed paths

Severity: Medium

Each service build job has a condition like:

```yaml
if: github.event_name == 'push' || ...
```

This means all service build jobs run on every push to `develop`, `staging`, and `main`.

Impact:

- Higher CI runtime and cost.
- All images are rebuilt and pushed even when unrelated files change.

Recommendation:

- If intentional, keep this behavior because it ensures all images are refreshed for every environment promotion.
- If optimization is preferred, remove the broad `github.event_name == 'push'` condition and rely on path filters plus `deploy_all`.

### Finding 3: Node.js 20 is configured in CI

Severity: Medium

The CI workflow uses Node.js `20` for dashboard and gateway builds.

Impact:

- GitHub Actions has announced Node 20 runtime deprecation for actions, and project runtime dependencies may eventually need alignment.
- This does not necessarily mean application Node.js 20 is unusable, but it should be tracked.

Recommendation:

- Plan migration to Node.js 22 or 24 for CI and Docker images.
- Validate compatibility for `vite`, `vitest`, gateway runtime, and Docker builds before changing.

### Finding 4: Security image scans are visibility-only

Severity: Medium

Full Trivy image scans use:

```yaml
exit-code: "0"
```

Impact:

- HIGH/CRITICAL image vulnerabilities are reported but do not block production deployment.

Recommendation:

- Keep visibility-only mode while base image findings are being triaged.
- Move production image scans to `exit-code: "1"` for CRITICAL fixed vulnerabilities after remediation policy is agreed.

### Finding 5: IaC security scans are soft-fail

Severity: Medium

Checkov and tfsec are configured to soft-fail.

Impact:

- Terraform security issues do not block deployments.

Recommendation:

- Review Checkov/tfsec output regularly.
- Establish a baseline and then fail on new high-severity findings.

### Finding 6: Production smoke test uses placeholder URL

Severity: High

Production smoke test calls:

```text
https://yourapp.example.com/health
```

Impact:

- Production deploys may fail incorrectly, or the smoke test may not validate the real service.

Recommendation:

- Replace with the real production endpoint.
- Consider adding smoke tests for API endpoints behind task-gateway as well as dashboard health.

### Finding 7: Nightly cleanup destroys dev automatically

Severity: Medium

The nightly cleanup workflow runs `terraform destroy -auto-approve` for dev every night.

Impact:

- Useful for cost control.
- Risky if developers expect long-lived dev infrastructure or active debugging state.

Recommendation:

- Confirm this is an intentional operating model.
- Consider adding a GitHub environment approval or an opt-out guard variable for periods when dev should remain running.

### Finding 8: Reusable security workflow cannot be manually dispatched

Severity: Low

`security-scanning.yml` only supports `workflow_call`.

Impact:

- Security scans cannot be started directly from the Actions UI.

Recommendation:

- Add `workflow_dispatch` to `security-scanning.yml` if manual scan runs are useful.
- Alternatively, add a manual trigger to `deploy.yml` that calls security scanning without deploying.

## Suggested Audit Checklist

Use this checklist during reviews:

- Confirm CI ran on the expected commit SHA.
- Confirm all service build/test jobs passed.
- Confirm pushed image tags match the commit SHA.
- Confirm Deploy was triggered automatically by the successful CI workflow run.
- Confirm the security scan tier matches the branch.
- Confirm security scan summary passed.
- Confirm Helm deployed the commit SHA image tag, not `latest`.
- Confirm rollout checks passed for all four services.
- Confirm production smoke test uses the real endpoint.
- Confirm workflow changes are present on the default branch.
- Review uploaded security artifacts after comprehensive/full scans.

## Recommended Next Improvements

1. Replace placeholder environment URLs with real dev, staging, and production endpoints.
2. Add manual dispatch support for security-only audit runs.
3. Decide whether Trivy image scans should block on fixed CRITICAL vulnerabilities.
4. Add Helm lint/template validation in CI for `helm/microservices`.
5. Add Terraform validation/format/plan checks before deployment.
6. Pin major external scanner/action versions where possible instead of using floating tags like `master` or `latest`.
7. Add concurrency controls to prevent overlapping deploys per environment.
8. Add deployment notifications or status summaries for audit traceability.
