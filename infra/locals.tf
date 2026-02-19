locals {
  ProjectName = "relationship-networking"
  global_tags = {
    Project   = local.ProjectName
    ManagedBy = "Terraform"
  }
  azs = ["ap-southeast-1"]
}