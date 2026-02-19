# Relationship Website Infrastructure
Dự án này chứa mã nguồn Terraform để triển khai cơ sở hạ tầng cho hệ thống "Relationship Website". Kiến trúc sử dụng mô hình Serverless kết hợp với VPC để bảo mật lớp dữ liệu.

📋 Tổng quan kiến trúc
Hệ thống được triển khai trên AWS tại vùng Singapore (ap-southeast-1) bao gồm các thành phần chính:
• Auth: Amazon Cognito (User Pool) để quản lý định danh người dùng.
• API: Amazon API Gateway đóng vai trò là entry point.
• Compute: AWS Lambda chạy trong Private Subnet.
• Database: Amazon RDS (trong Private Subnet).
• Storage: Amazon S3 (truy cập qua VPC Endpoint).
• Networking: VPC tuỳ chỉnh với Private Subnets, không sử dụng NAT Gateway.

🏷️ Global Tags
Tất cả các resources đều được gắn nhãn mặc định:
• ProjectName: relationship-networking
• ManagedBy: Terraform

--------------------------------------------------------------------------------
🛠️ Chi tiết triển khai
Dưới đây là cấu hình chi tiết cho các resources và modules.

## 1. Networking (VPC Module)
Sử dụng module terraform-aws-modules/vpc/aws. Cấu hình này tạo ra một mạng riêng biệt, đảm bảo Lambda có thể kết nối tới RDS an toàn và truy cập S3 mà không cần đi qua Internet công cộng (tiết kiệm chi phí NAT).
Cấu hình Terraform:
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "relationship-website-vpc"
  cidr = "10.0.0.0/16"

  ### Cấu hình Availability Zones và Subnets
  azs             = ["ap-southeast-1a"] 
  private_subnets = ["10.0.1.0/24"]     # Subnet chứa Lambda & RDS
  public_subnets  = []                  # Không cần public subnet (Tiết kiệm NAT)

  ### Cấu hình NAT Gateway (Tắt để tiết kiệm chi phí)
  enable_nat_gateway = false
  enable_vpn_gateway = false

  ### Cấu hình DNS (Bắt buộc để RDS và S3 Endpoint hoạt động đúng)
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = var.global_tags
}

resources "vpc_endpoint" "vpc_gateway_endpoint_s3"{
    vpc_id = module.vpc.vpc_id
    
} 

## 2. Compute & API (Modules)
• AWS Lambda (Module):
    ◦ Được triển khai bên trong module.vpc.private_subnets.
    ◦ Gắn với Security Group cho phép Egress tới RDS và S3 (prefix list).
• API Gateway (Module):
    ◦ Loại: HTTP API (hoặc REST tuỳ nhu cầu).
    ◦ Tích hợp với Cognito Authorizer để xác thực token trước khi gọi Lambda.

## 3. Database & Storage
• Amazon RDS (Module):
    ◦ Nằm trong cùng private_subnets với Lambda.
    ◦ Không public ra ngoài internet (publicly_accessible = false).
• Amazon S3 (Resource):
    ◦ Bucket lưu trữ object data (ảnh, tài liệu).
    ◦ Chặn truy cập công khai (Block Public Access).

## 4. Security (Resources)
Hệ thống sử dụng mô hình Security Group Referencing để tăng cường bảo mật:
• SG-Lambda (Resource):
    ◦ Gắn vào Lambda Function.
    ◦ Outbound rule: Allow port 5432/3306 tới SG-RDS.
    ◦ Outbound rule: Allow port 443 tới S3 Prefix List (qua VPC Endpoint).
• SG-RDS (Resource):
    ◦ Gắn vào RDS Instance.
    ◦ Inbound rule: Chỉ chấp nhận traffic port DB từ Source là SG-Lambda.

## 5. Identity (Resource)
• Amazon Cognito:
    ◦ Tạo User Pool để đăng ký/đăng nhập.
    ◦ Tạo App Client để tích hợp với Frontend.

--------------------------------------------------------------------------------
🚀 Hướng dẫn triển khai
1. Khởi tạo Terraform:
2. Kiểm tra kế hoạch (Plan):
3. Áp dụng (Apply):

--------------------------------------------------------------------------------
📝 Ghi chú về luồng dữ liệu (Data Flow)
1. User đăng nhập qua Cognito -> Nhận Token.
2. User gọi API Gateway kèm Token -> API Gateway xác thực.
3. API Gateway gọi Lambda -> Lambda chạy trong Private Subnet.
4. Lambda gọi RDS (qua Private IP) và gọi S3 (qua VPC Gateway Endpoint).