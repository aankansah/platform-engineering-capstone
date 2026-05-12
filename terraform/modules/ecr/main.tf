# terraform/modules/github-oidc/main.tf

variable "github_org" {
  description = "Your GitHub username or organization name"
  type        = string
}

variable "github_repo" {
  description = "Repository name"
  type        = string
}

variable "allowed_branches" {
  description = "Branches allowed to assume AWS roles"
  type        = list(string)
  default     = ["main", "develop", "staging"]
}

variable "project_name" {
  type    = string
  default = "capstone"
}

# Register GitHub as an OIDC Identity Provider in AWS
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  # GitHub's OIDC thumbprint (stable — rarely changes)
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  tags = {
    Name    = "GitHub Actions OIDC Provider"
    Project = var.project_name
  }
}

# Local helper: build the list of allowed repo:branch subjects
locals {
  allowed_subjects = [
    for branch in var.allowed_branches :
    "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/${branch}"
  ]
}

# IAM Role that GitHub Actions workflows will assume
resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = local.allowed_subjects
        }
      }
    }]
  })

  tags = {
    Purpose = "GitHub Actions CI/CD"
    Project = var.project_name
  }
}

# For this portfolio project, we use broad permissions.
# In a real company you would create a least-privilege custom policy.
resource "aws_iam_role_policy_attachment" "github_actions_admin" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

output "role_arn" {
  value       = aws_iam_role.github_actions.arn
  description = "Paste this ARN into GitHub Actions workflows as role-to-assume"
}

output "oidc_provider_arn" {
  value = aws_iam_openid_connect_provider.github.arn
}