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

variable "allowed_environments" {
  description = "GitHub Environments allowed to assume AWS roles"
  type        = list(string)
  default     = ["dev", "staging", "production"]
}

variable "project_name" {
  type    = string
  default = "capstone"
}
