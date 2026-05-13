terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.44.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "github_oidc" {
  source           = "../modules/github-oidc"
  github_org       = "aankansah" # ← change this
  github_repo      = "platform-engineering-capstone"
  allowed_branches = ["main", "develop", "staging"]
  project_name     = "capstone"
}

output "github_actions_role_arn" {
  value = module.github_oidc.role_arn
}
