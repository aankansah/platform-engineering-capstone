variable "environment" { type = string }

variable "project_name" { type = string }

variable "cluster_version" {
  type    = string
  default = "1.35"
}

variable "vpc_id" { type = string }

variable "subnet_ids" { type = list(string) }

variable "cluster_autoscaler_role_arn" { type = string }

variable "instance_type" { type = string }

variable "node_count" { type = number }

variable "min_nodes" {
  type    = number
  default = 1
}

variable "max_nodes" {
  type    = number
  default = 10
}
