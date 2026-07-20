# Monitoring Installation With kube-prometheus-stack

This guide documents the Helm-based monitoring setup for the capstone
Kubernetes environment.

Use the `kube-prometheus-stack` Helm chart from `prometheus-community`. It
installs Prometheus, Grafana, Alertmanager, exporters, dashboards, and the
Prometheus Operator together.

## 1. Add the Prometheus Community Helm Repository

```bash
helm repo add prometheus-community \
  https://prometheus-community.github.io/helm-charts

helm repo update
```

## 2. Install kube-prometheus-stack

```bash
helm upgrade --install prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

This installs the monitoring stack into the `monitoring` namespace.

## 3. Confirm the Installation

```bash
kubectl get pods -n monitoring
```

Wait until the main pods are running.

Useful watch command:

```bash
kubectl get pods -n monitoring -w
```

Common pods include:

```text
prometheus-stack-grafana-...
prometheus-stack-kube-prom-operator-...
prometheus-prometheus-stack-kube-prom-prometheus-...
alertmanager-prometheus-stack-kube-prom-alertmanager-...
```

## 4. Access Prometheus

Port-forward the Prometheus service:

```bash
kubectl port-forward \
  svc/prometheus-stack-kube-prom-prometheus \
  -n monitoring \
  9090:9090
```

Open:

```text
http://localhost:9090
```

## 5. Access Grafana

Port-forward the Grafana service:

```bash
kubectl port-forward \
  svc/prometheus-stack-grafana \
  -n monitoring \
  3000:80
```

Open:

```text
http://localhost:3000
```

## 6. Get the Grafana Admin Password

```bash
kubectl get secret prometheus-stack-grafana \
  -n monitoring \
  -o jsonpath='{.data.admin-password}' | base64 --decode && echo
```

Login details:

```text
Username: admin
Password: decoded password
```

Grafana is included by default in `kube-prometheus-stack`, so a separate Grafana
installation is not required.

## Current Setup

- Helm release name: `prometheus-stack`
- Namespace: `monitoring`
- Chart: `prometheus-community/kube-prometheus-stack`
- Prometheus local URL through port-forward: `http://localhost:9090`
- Grafana local URL through port-forward: `http://localhost:3000`
- Custom dashboard files can be stored under:
  - `monitoring/dashboards/`

## Helpful Commands

Check all monitoring resources:

```bash
kubectl get all -n monitoring
```

Check Helm release status:

```bash
helm status prometheus-stack -n monitoring
```

List services:

```bash
kubectl get svc -n monitoring
```

Check Grafana logs:

```bash
kubectl logs deployment/prometheus-stack-grafana -n monitoring
```

Check Prometheus pods:

```bash
kubectl get pods -n monitoring \
  -l app.kubernetes.io/name=prometheus
```

Uninstall the monitoring stack:

```bash
helm uninstall prometheus-stack -n monitoring
```

Delete the namespace after uninstalling, if the environment should be fully
cleaned up:

```bash
kubectl delete namespace monitoring
```

## Notes

- Do not commit decoded Grafana passwords.
- For local access, prefer `kubectl port-forward` instead of exposing services
  publicly.
- For production-style usage, configure persistent storage, ingress, SSO, RBAC,
  alert receivers, and retention settings before relying on this stack for
  operational monitoring.

## References

- kube-prometheus-stack chart README:
  `https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/README.md`
- kube-prometheus-stack chart package:
  `https://github.com/orgs/prometheus-community/packages/container/package/charts%2Fkube-prometheus-stack`

