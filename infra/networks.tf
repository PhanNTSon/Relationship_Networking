module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~>5.0"
  name    = local.ProjectName + "-vpc"
  cidr    = "10.0.0.0/16"

  azs             = local.azs
  public_subnets  = []
  private_subnets = ["10.0.1.0/24"]

  enable_nat_gateway = false
  enable_vpn_gateway = false

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = local.global_tags
}

resource "aws_vpc_endpoint" "vpc_gateway_endpoint_s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = module.vpc.private_route_table_ids

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::my-lambda-bucket",
          "arn:aws:s3:::my-lambda-bucket/*"
        ]
      }
    ]
  })
}