variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}

variable "repositories" {
  type    = list(string)
  default = ["task-dashboard", "task-gateway", "task-validator", "task-enricher"]
}
