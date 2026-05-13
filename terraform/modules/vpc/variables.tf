variable "environment" { type = string }
variable "project_name" { type = string }
variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}
variable "nat_gateway_count" {
  type    = number
  default = 1
}