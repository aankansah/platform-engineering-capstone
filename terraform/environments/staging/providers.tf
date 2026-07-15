provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = "staging"
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}