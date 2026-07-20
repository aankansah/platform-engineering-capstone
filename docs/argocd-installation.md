# Argo CD Installation Summary

This guide documents the Helm-based Argo CD installation flow used for the
capstone Kubernetes environment.

## 1. Add the Argo CD Helm Repository

```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
```

## 2. Install Argo CD With Helm

```bash
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace
```

This installs Argo CD into the `argocd` namespace.

## 3. Confirm the Installation

```bash
kubectl get pods -n argocd
```

Wait until the Argo CD pods are running.

Useful watch command:

```bash
kubectl get pods -n argocd -w
```

## 4. Access the Argo CD Web Interface

Port-forward the Argo CD server service:

```bash
kubectl port-forward svc/argocd-server \
  -n argocd \
  8080:443
```

Open:

```text
https://localhost:8080
```

Your browser may warn about a self-signed certificate. That is expected for this
local port-forwarded setup.

## 5. Get the Initial Admin Password

```bash
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath='{.data.password}' | base64 --decode && echo
```

Login details:

```text
Username: admin
Password: decoded initial password
```

## 6. Change the Admin Password

After logging into the Argo CD web interface:

```text
User Info -> Update Password
```

Enter the initial password and set a memorable password.

The Argo CD CLI is not required for this step.

## 7. Delete the Initial Password Secret

After confirming that the new password works:

```bash
kubectl delete secret argocd-initial-admin-secret -n argocd
```

Confirm that it was deleted:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd
```

It should return a `NotFound` error.

## Current Setup

- Argo CD is installed with the upstream Helm chart `argo/argo-cd`.
- The release name is `argocd`.
- The namespace is `argocd`.
- The web UI is accessed locally through `kubectl port-forward`.
- GitOps manifests are intended to live under:
  - `argocd/applications/`
  - `argocd/projects/`

## Helpful Commands

Check Argo CD resources:

```bash
kubectl get all -n argocd
```

Check Argo CD server logs:

```bash
kubectl logs deployment/argocd-server -n argocd
```

Restart the Argo CD server deployment:

```bash
kubectl rollout restart deployment/argocd-server -n argocd
kubectl rollout status deployment/argocd-server -n argocd --timeout=180s
```

Uninstall Argo CD:

```bash
helm uninstall argocd -n argocd
```

Delete the namespace after uninstalling, if the environment should be fully
cleaned up:

```bash
kubectl delete namespace argocd
```

## Notes

- Keep the initial admin password secret only long enough to set a new password.
- Do not commit decoded passwords or screenshots containing passwords.
- For production-style usage, prefer SSO/RBAC over long-lived shared admin
  credentials.

