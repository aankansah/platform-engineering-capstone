terraform {
  backend "s3" {
    bucket         = "ent-aws-capstone-terraform-state-dev-912951360942" # ← paste from bootstrap output
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ent-aws-capstone-terraform-lock-dev"
  }
}