resource "aws_ecr_repository" "services" {
  for_each = toset(var.repositories)

  name                 = "${var.project_name}/${each.key}"
  image_tag_mutability = "MUTABLE" # Allows latest tag to be overwritten

  image_scanning_configuration {
    scan_on_push = true # Free ECR basic scanning on every push
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Lifecycle policy: keep only the last 10 images to control storage costs
resource "aws_ecr_lifecycle_policy" "cleanup" {
  for_each   = aws_ecr_repository.services
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}