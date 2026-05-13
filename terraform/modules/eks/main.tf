
locals {
  cluster_name = "${var.project_name}-${var.environment}"
}

data "aws_partition" "current" {}

resource "aws_iam_role" "ebs_csi" {
  name = "${local.cluster_name}-ebs-csi"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "pods.eks.amazonaws.com"
        }
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ebs_csi" {
  role       = aws_iam_role.ebs_csi.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
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
    aws-ebs-csi-driver = {
      most_recent = true
      pod_identity_association = [{
        role_arn        = aws_iam_role.ebs_csi.arn
        service_account = "ebs-csi-controller-sa"
      }]
      timeouts = {
        create = "40m"
        update = "40m"
      }
    } # Required for PersistentVolumes
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

  # tags = {
  #   Environment = var.environment
  #   Project     = var.project_name
  #   ManagedBy   = "Terraform"
  # }
}
