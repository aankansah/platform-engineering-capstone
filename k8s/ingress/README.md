# Cluster Ingress Routes

These manifests expose local platform services through the `ingress-nginx`
controller. Keep each `Ingress` in the same namespace as the Service it routes
to.

`ingress-nginx` does not create DNS records. It only routes requests for hosts
that already resolve to the ingress controller. In this local Kind environment,
that means adding hostnames to `/etc/hosts` and forwarding traffic to the
controller Service.

## Hosts

Add these hostnames to your local `/etc/hosts` file. For Kind, use the address
that reaches the ingress controller. If you port-forward ingress-nginx locally,
use `127.0.0.1`.

```text
127.0.0.1 taskflow.local
127.0.0.1 api.taskflow.local
127.0.0.1 kafka-ui.taskflow.local
127.0.0.1 argocd.local
127.0.0.1 grafana.local
127.0.0.1 prometheus.local
127.0.0.1 portainer.local
```

If the ingress-nginx Service shows `EXTERNAL-IP: <pending>` in Kind, either use
the assigned NodePorts or port-forward the controller:

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80 8443:443
```

With this port-forward, `8080` is HTTP and `8443` is HTTPS. Do not use
`https://...:8080`; that sends TLS to the plain HTTP listener and causes
`ERR_SSL_PROTOCOL_ERROR`.

With that port-forward, use `http://grafana.local:8080`,
`http://prometheus.local:8080`, `http://portainer.local:8080`, and
`https://argocd.local:8443`.

The hostnames above will not appear in `kubectl get service`. Services have
internal cluster DNS names such as
`prometheus-stack-grafana.monitoring.svc.cluster.local`; Ingress hosts are
external HTTP routing names used by your browser.

## Taskflow Application Routes

The Taskflow routes are rendered by the `helm/microservices` chart when
`ingress.enabled=true`.

```bash
helm upgrade --install microservices-dev helm/microservices \
  --namespace taskflow \
  --create-namespace \
  --values helm/microservices/values.dev.yaml
```

Routes:

```text
http://taskflow.local          -> task-dashboard:3000
http://api.taskflow.local      -> task-gateway:8080
http://kafka-ui.taskflow.local -> kafka-ui:8080
```

The dashboard also proxies `/api` to `task-gateway`, so normal UI usage should
work from `http://taskflow.local`.

## Platform Routes

Apply the platform ingress manifests after the backing Helm releases exist:

```bash
kubectl apply -f k8s/ingress/argocd-ingress.yaml
kubectl apply -f k8s/ingress/monitoring-ingress.yaml
kubectl apply -f k8s/ingress/portainer-ingress.yaml
```

Routes:

```text
https://argocd.local:8443    -> argocd-server:443
http://grafana.local:8080    -> prometheus-stack-grafana:80
http://prometheus.local:8080 -> prometheus-stack-kube-prom-prometheus:9090
http://portainer.local:8080  -> portainer:9000
```

Argo CD is configured as an HTTPS backend because the default `argocd-server`
Service serves TLS on port `443`.

## Verify

```bash
kubectl get ingress -A
kubectl describe ingress argocd-server -n argocd
kubectl describe ingress grafana -n monitoring
kubectl describe ingress prometheus -n monitoring
kubectl describe ingress portainer -n portainer
```
