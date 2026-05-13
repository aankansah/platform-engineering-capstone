variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}

variable "repositories" {
  type    = list(string)
  default = ["javascript-api", "java-service", "rust-processor"]
}
