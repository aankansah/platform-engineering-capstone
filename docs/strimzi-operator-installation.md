# Strimzi Operator Installation With Helm

This guide explains how to install the Strimzi Kafka Operator with Helm for the
local Kind/Kubernetes workflow used by this repository.

The Helm chart in `helm/microservices` creates Strimzi custom resources:

- `Kafka`
- `KafkaNodePool`

Those resources do not work until the Strimzi Operator and its CRDs are installed
in the cluster.

## How Strimzi Fits This Chart

The repository chart defines Kafka in:

```text
helm/microservices/templates/kafka-cluster.yaml
```

The chart does not directly create Kafka broker Pods. Instead, it creates a
Strimzi `Kafka` custom resource:

```yaml
apiVersion: kafka.strimzi.io/v1
kind: Kafka
metadata:
  name: ent-kafka
spec:
  kafka:
    version: "4.3.0"
```

The Strimzi Operator watches that resource and creates the actual Kafka
workloads, services, and supporting resources.

## Prerequisites

- A running Kubernetes cluster, such as Kind.
- `kubectl` configured for that cluster.
- Helm 3 installed.

Confirm the active cluster:

```bash
kubectl config current-context
```

For the local Kind setup, use:

```bash
kubectl config use-context kind-ent-aws-capstone-local
```

## 1. Add the Strimzi Helm Repository

```bash
helm repo add strimzi https://strimzi.io/charts/
helm repo update
```

## 2. Create the Application Namespace

Use the same namespace where the microservices chart will be installed. The
examples below use `taskflow`.

```bash
kubectl create namespace taskflow \
  --dry-run=client \
  -o yaml \
  | kubectl apply -f -
```

## 3. Install the Strimzi Operator

Install the operator into `taskflow`:

```bash
helm upgrade --install strimzi-kafka-operator strimzi/strimzi-kafka-operator \
  --namespace taskflow \
  --set watchAnyNamespace=false
```

With this setting, the operator watches the namespace where it is installed.
That matches the local workflow where the Kafka resource is also installed into
`taskflow`.

## 4. Wait for the Operator

```bash
kubectl rollout status deployment/strimzi-cluster-operator \
  -n taskflow \
  --timeout=180s
```

Check the operator Pod:

```bash
kubectl get pods -n taskflow
```

You should see a Pod similar to:

```text
strimzi-cluster-operator-...
```

## 5. Confirm Strimzi CRDs

```bash
kubectl get crd | grep strimzi
```

Expected CRDs include:

```text
kafkas.kafka.strimzi.io
kafkanodepools.kafka.strimzi.io
kafkatopics.kafka.strimzi.io
kafkausers.kafka.strimzi.io
```

## 6. Configure Kafka Values

The chart expects Kafka settings in the values file used for the install.

For local/dev testing, a minimal Kafka block looks like this:

```yaml
kafka:
  enabled: true
  name: ent-kafka
  version: 4.3.0
  replicas: 1
  storage:
    type: ephemeral
```

Do not add a Kafka broker image here unless the chart template uses it. Strimzi
normally selects Kafka broker images from the operator configuration based on
`spec.kafka.version`.

Kafka UI is separate and does use a normal Deployment image:

```yaml
kafkaUi:
  enabled: true
  image: provectuslabs/kafka-ui:latest
  service:
    port: 8080
```

## 7. Render the Microservices Chart

```bash
helm template microservices-dev helm/microservices \
  --namespace taskflow \
  --values helm/microservices/values.dev.yaml
```

If this fails with a nil pointer, the values file is missing a block referenced
by one of the templates. Add the missing block or disable the related feature.

## 8. Install the Microservices Chart

```bash
helm upgrade --install microservices-dev helm/microservices \
  --namespace taskflow \
  --create-namespace \
  --values helm/microservices/values.dev.yaml
```

## 9. Watch Kafka Become Ready

```bash
kubectl get kafka,kafkanodepool,pods -n taskflow
```

Wait for the Kafka custom resource:

```bash
kubectl wait kafka/ent-kafka \
  -n taskflow \
  --for=condition=Ready \
  --timeout=300s
```

## Troubleshooting

### No matches for kind `Kafka`

The Strimzi CRDs are not installed.

Fix:

```bash
helm upgrade --install strimzi-kafka-operator strimzi/strimzi-kafka-operator \
  --namespace taskflow \
  --set watchAnyNamespace=false
```

Then confirm:

```bash
kubectl get crd | grep strimzi
```

### Kafka resource exists but no Kafka Pods appear

Check the operator logs:

```bash
kubectl logs deployment/strimzi-cluster-operator -n taskflow
```

Also inspect the Kafka resource:

```bash
kubectl describe kafka ent-kafka -n taskflow
```

### Kafka image value appears unused

This is expected with the current chart. The `Kafka` custom resource uses:

```yaml
spec:
  kafka:
    version: "4.3.0"
```

The Strimzi Operator resolves the broker image for that Kafka version. The
`kafka.image.repository` and `kafka.image.tag` values only matter if the
`kafka-cluster.yaml` template is changed to use them.

### NetworkPolicy blocks local connectivity

For early local testing, disable NetworkPolicies in the values file:

```yaml
networkPolicies:
  enabled: false
```

Re-enable them after Kafka and the app Pods are running.

## References

- Strimzi Helm chart repository: `https://strimzi.io/charts/`
- Strimzi blog: `https://strimzi.io/blog/2018/11/01/using-helm/`
