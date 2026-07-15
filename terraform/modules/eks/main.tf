locals {
  cluster_name = "${var.project_name}-${var.environment}"
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.20.0"

  name               = local.cluster_name
  kubernetes_version = var.cluster_version

  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids

  # Allow kubectl access from within the cluster (required for Helm deploys from CI)
  endpoint_public_access = true

  enable_cluster_creator_admin_permissions = true

  # Add-ons: managed by AWS, auto-updated
  addons = {
    coredns                = {}
    eks-pod-identity-agent = { before_compute = true }
    kube-proxy             = {}
    vpc-cni                = { before_compute = true }
    # Uncomment when Kubernetes workloads need EBS-backed PersistentVolumes.
    # aws-ebs-csi-driver = {
    #   most_recent = true
    #   timeouts = {
    #     create = "40m"
    #     update = "40m"
    #   }
    # }
  }

  eks_managed_node_groups = {
    primary = {
      instance_types = [var.instance_type]

      min_size     = var.min_nodes
      max_size     = var.max_nodes
      desired_size = var.node_count

      labels = {
        Environment = var.environment
        NodeGroup   = "primary"
      }

      tags = {
        "k8s.io/cluster-autoscaler/enabled"                                = "true"
        "k8s.io/cluster-autoscaler/${var.project_name}-${var.environment}" = "owned"
      }
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

resource "aws_eks_pod_identity_association" "cluster_autoscaler" {
  cluster_name    = module.eks.cluster_name
  namespace       = "kube-system"
  service_account = "cluster-autoscaler"
  role_arn        = var.cluster_autoscaler_role_arn
}
