variable "project_name" {
  default = "ent-aws-capstone"
}

variable "region" {
  default = "us-east-1"
}

# State infrastructure for all three environments
resource "aws_s3_bucket" "state" {
  for_each = toset(["dev", "staging", "production"])

  bucket = "${var.project_name}-terraform-state-${each.key}-${data.aws_caller_identity.current.account_id}"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Environment = each.key
    Purpose     = "Terraform Remote State"
    Project     = var.project_name
  }
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_versioning" "state" {
  for_each = aws_s3_bucket.state
  bucket   = each.value.id

  versioning_configuration {
    status = "Enabled" # Version to allow state rollback
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  for_each = aws_s3_bucket.state
  bucket   = each.value.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256" # Encrypt state at rest (contains sensitive data)
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  for_each = aws_s3_bucket.state
  bucket   = each.value.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Dynamo DB table for state locking
resource "aws_dynamodb_table" "lock" {
  for_each     = toset(["dev", "staging", "production"])
  name         = "${var.project_name}-terraform-lock-${each.key}"
  billing_mode = "PAY_PER_REQUEST" # ~$0.01/month — negligible cost
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Environment = each.key
    Purpose     = "Terraform State Locking"
  }
}

# Output bucket and table names
output "state_buckets" {
  value = { for k, v in aws_s3_bucket.state : k => v.id }
}

output "lock_tables" {
  value = { for k, v in aws_dynamodb_table.lock : k => v.name }
}