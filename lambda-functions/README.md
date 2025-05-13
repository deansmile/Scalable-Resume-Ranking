# 🧩 Lambda Functions Overview

This project uses multiple AWS Lambda functions as microservices to automate resume parsing, job description analysis, and intelligent resume-to-job ranking.

## Lambda Functions

| Lambda Name | Purpose |
|-------------|---------|
| `lambda_generate_presigned_url` | Generates a pre-signed S3 URL for secure resume uploads |
| `lambda_parse_resume` | Triggered by S3 upload; uses Textract to extract resume text |
| `lambda_analyze_jd` | Analyzes job description text using Amazon Comprehend |
| `lambda_rank_bedrock` | Scores resumes against job descriptions using Bedrock LLM and updates results |
| `lambda_search_resumes` | Retrieves ranked candidates from OpenSearch |
| `lambda_view_resume` | Generates signed S3 URL to securely view a candidate's resume PDF |

## Microservices Design

Each Lambda function performs a single responsibility:
- `lambda_generate_presigned_url` → Upload link generation  
- `lambda_parse_resume` → Resume text parsing  
- `lambda_analyze_jd` → Job description entity extraction  
- `lambda_rank_bedrock` → Resume-JD ranking using Bedrock  
- `lambda_search_resumes` → Retrieve ranked candidates  
- `lambda_view_resume` → Secure resume viewing

The system is fully event-driven (S3 triggers, API Gateway calls) and uses DynamoDB and OpenSearch for data storage and communication.

This ensures modularity, scalability, fault-tolerance, and independent deployability of each Lambda microservice.

---
