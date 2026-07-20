# ingress-nginx Installation Summary

This guide documents the Helm-based ingress-nginx installation flow for the
capstone Kubernetes environment.

The ingress controller should run in its own namespace. Application `Ingress`
resources should normally live in the same namespace as the application Service
they route to.

## Namespace Layout

Typical namespace separation:

```text
ingress-nginx  -> ingress controller
argocd         -> Argo CD
monitoring     -> Prometheus and Grafana
taskflow       -> application workloads
```

This keeps platform controllers separate from application workloads.

## 1. Add the ingress-nginx Helm Repository

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```

## 2. Install ingress-nginx

```bash
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace
```

This installs the ingress controller into the `ingress-nginx` namespace.

## 3. Confirm the Installation

```bash
kubectl get pods -n ingress-nginx
```

Wait until the controller pod is running.

Useful watch command:

```bash
kubectl get pods -n ingress-nginx -w
```

Check the controller service:

```bash
kubectl get svc -n ingress-nginx
```

In a local Kind cluster, it is normal for the controller Service to show:

```text
TYPE           EXTERNAL-IP
LoadBalancer   <pending>
```

Kind does not create a cloud load balancer. Use either the assigned NodePorts or
port-forward the ingress controller for local browser access.

## 4. Where Ingress Resources Should Live

Keep the ingress controller in:

```text
ingress-nginx
```

Keep application `Ingress` resources in the namespace of the Service they route
to. For this project, that is usually:

```text
taskflow
```

For example, an Ingress routing to `task-dashboard` should be created in
`taskflow`, because the `task-dashboard` Service is in `taskflow`.

Do not put application Ingress resources in `ingress-nginx` unless the backend
Service is also in `ingress-nginx`.

## 5. Example Application Ingress Shape

Example only:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: task-dashboard
  namespace: taskflow
spec:
  ingressClassName: nginx
  rules:
    - host: taskflow.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: task-dashboard
                port:
                  number: 3000
```

The important parts are:

- `namespace: taskflow`
- `ingressClassName: nginx`
- backend Service name and port matching the application Service

## 6. DNS and Local Hostnames

`ingress-nginx` does not allocate DNS names by itself. It watches Kubernetes
`Ingress` resources and routes HTTP requests based on the `host` rule.

For example, an Ingress can say:

```text
taskflow.local -> task-dashboard
argocd.local   -> argocd-server
grafana.local  -> prometheus-stack-grafana
```

Something outside ingress-nginx must make those hostnames resolve to the ingress
controller.

For this local Kind setup, add the hostnames to `/etc/hosts`:

```bash
sudo sh -c 'cat >> /etc/hosts <<EOF
127.0.0.1 taskflow.local
127.0.0.1 api.taskflow.local
127.0.0.1 kafka-ui.taskflow.local
127.0.0.1 argocd.local
127.0.0.1 grafana.local
127.0.0.1 prometheus.local
127.0.0.1 portainer.local
EOF'
```

Then port-forward the ingress controller:

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80 8443:443
```

With this port-forward:

```text
8080 -> ingress-nginx HTTP
8443 -> ingress-nginx HTTPS
```

Do not use `https://...:8080`. Port `8080` is plain HTTP, so the browser will
show `ERR_SSL_PROTOCOL_ERROR` if HTTPS is used there.

Open the services through ingress-nginx:

```text
http://taskflow.local:8080
http://api.taskflow.local:8080
http://kafka-ui.taskflow.local:8080
https://argocd.local:8443
http://grafana.local:8080
http://prometheus.local:8080
http://portainer.local:8080
```

## 7. Kubernetes Service DNS vs Ingress Hosts

Do not expect external URLs such as `taskflow.local` or `grafana.local` to
appear in `kubectl get service`. Kubernetes Services expose internal cluster DNS
names, while Ingress exposes HTTP routes.

Internal Service DNS examples:

```text
task-dashboard.taskflow.svc.cluster.local
task-gateway.taskflow.svc.cluster.local
kafka-ui.taskflow.svc.cluster.local
argocd-server.argocd.svc.cluster.local
prometheus-stack-grafana.monitoring.svc.cluster.local
prometheus-stack-kube-prom-prometheus.monitoring.svc.cluster.local
portainer.portainer.svc.cluster.local
```

Ingress host examples:

```text
taskflow.local
api.taskflow.local
kafka-ui.taskflow.local
argocd.local
grafana.local
prometheus.local
portainer.local
```

The Service DNS names are used by pods inside the cluster. The Ingress hostnames
are used by your browser or external clients.

## 8. Project Ingress Resources

Taskflow application routes are rendered by the `helm/microservices` chart:

```bash
helm upgrade --install microservices-dev helm/microservices \
  --namespace taskflow \
  --create-namespace \
  --values helm/microservices/values.dev.yaml
```

Platform routes are kept as Kubernetes manifests:

```bash
kubectl apply -f k8s/ingress/argocd-ingress.yaml
kubectl apply -f k8s/ingress/monitoring-ingress.yaml
kubectl apply -f k8s/ingress/portainer-ingress.yaml
```

Or apply all platform ingress manifests at once:

```bash
kubectl apply -f k8s/ingress
```

Current route ownership:

```text
helm/microservices -> taskflow.local, api.taskflow.local, kafka-ui.taskflow.local
k8s/ingress        -> argocd.local, grafana.local, prometheus.local, portainer.local
```

With the local port-forward above, use these full URLs:

```text
http://taskflow.local:8080
http://api.taskflow.local:8080
http://kafka-ui.taskflow.local:8080
https://argocd.local:8443
http://grafana.local:8080
http://prometheus.local:8080
http://portainer.local:8080
```

If Argo CD shows `ERR_SSL_PROTOCOL_ERROR`, check the URL first. This is wrong:

```text
https://argocd.local:8080
```

Use `https://argocd.local:8443` for HTTPS, or `http://argocd.local:8080` for the
HTTP side of ingress-nginx.

## Helpful Commands

Check all ingress-nginx resources:

```bash
kubectl get all -n ingress-nginx
```

Check Helm release status:

```bash
helm status ingress-nginx -n ingress-nginx
```

Check controller logs:

```bash
kubectl logs deployment/ingress-nginx-controller -n ingress-nginx
```

List Ingress resources across all namespaces:

```bash
kubectl get ingress -A
```

Uninstall ingress-nginx:

```bash
helm uninstall ingress-nginx -n ingress-nginx
```

Delete the namespace after uninstalling, if the environment should be fully
cleaned up:

```bash
kubectl delete namespace ingress-nginx
```

## Notes

- The controller belongs in `ingress-nginx`.
- Application Ingress resources usually belong beside their Services, such as
  `taskflow`.
- In local Kind clusters, external LoadBalancer behavior may require additional
  setup such as port mappings or `kubectl port-forward`, depending on how the
  cluster was created.
