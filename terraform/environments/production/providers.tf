provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = "production"
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}