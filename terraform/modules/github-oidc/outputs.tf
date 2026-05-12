output "role_arn" {
  value       = aws_iam_role.github_actions.arn
  description = "Paste this ARN into GitHub Actions workflows as role-to-assume"
}

output "oidc_provider_arn" {
  value = aws_iam_openid_connect_provider.github.arn
}