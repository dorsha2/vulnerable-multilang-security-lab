terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region     = "us-east-1"
  access_key = "AKIAEXAMPLEINSECUREKEY"
  secret_key = "insecure-hardcoded-aws-secret"
}

resource "aws_s3_bucket" "public_logs" {
  bucket = "vulnerable-demo-public-logs-bucket"
}

resource "aws_s3_bucket_public_access_block" "public_logs" {
  bucket                  = aws_s3_bucket.public_logs.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_security_group" "open_ingress" {
  name        = "vulnerable-open-ingress"
  description = "Intentionally open SG for scanning demo"

  ingress {
    description = "SSH exposed to the world"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "RDP exposed to the world"
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_policy" "admin_star" {
  name        = "vulnerable-admin-star-policy"
  description = "Intentionally over-permissive policy for scanner testing"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = "*",
        Resource = "*"
      }
    ]
  })
}
