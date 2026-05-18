module "vpc" {
  source            = "../../modules/vpc"
  environment       = var.environment
  project_name      = var.project_name
  nat_gateway_count = 1
}

module "ecr" {
  source       = "../../modules/ecr"
  environment  = var.environment
  project_name = var.project_name
}

module "iam" {
  source       = "../../modules/iam"
  environment  = var.environment
  project_name = var.project_name
}

module "eks" {
  source                      = "../../modules/eks"
  environment                 = var.environment
  project_name                = var.project_name
  cluster_version             = "1.35"
  vpc_id                      = module.vpc.vpc_id
  subnet_ids                  = module.vpc.private_subnet_ids
  cluster_autoscaler_role_arn = module.iam.cluster_autoscaler_role_arn
  instance_type               = var.instance_type
  node_count                  = var.node_count
  min_nodes                   = 1
  max_nodes                   = 3
}
