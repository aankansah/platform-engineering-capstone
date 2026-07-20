resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  # GitHub's OIDC thumbprint
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  tags = {
    Name    = "GitHub Actions OIDC Provider"
    Project = var.project_name
  }
}

# List of allowed GitHub OIDC subjects.
# Jobs without a GitHub Environment use the branch subject format.
# Jobs with `environment:` use the environment subject format instead.
locals {
  allowed_branch_subjects = [
    for branch in var.allowed_branches :
    "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/${branch}"
  ]

  allowed_environment_subjects = [
    for environment in var.allowed_environments :
    "repo:${var.github_org}/${var.github_repo}:environment:${environment}"
  ]

  allowed_subjects = concat(local.allowed_branch_subjects, local.allowed_environment_subjects)
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

# In a real company you would create a least-privilege custom policy.
resource "aws_iam_role_policy_attachment" "github_actions_admin" {
  role = aws_iam_role.github_actions.name
  # Todo: Update to least-privilege permission
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
