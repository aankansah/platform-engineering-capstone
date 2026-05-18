output "cluster_name" {
  value = module.eks.cluster_name
}

output "ecr_repository_urls" {
  value = module.ecr.repository_urls
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "cluster_autoscaler_role_arn" {
  value = module.iam.cluster_autoscaler_role_arn
}
