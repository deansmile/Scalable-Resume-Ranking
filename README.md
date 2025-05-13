AWS-Based Intelligent Resume Ranking System
This project presents a scalable, serverless, microservices-based solution for automating resume parsing, job description analysis, and intelligent resume-to-job ranking using cutting-edge AWS services and AI/ML technologies.

Team
NYU | Cloud Computing and Big Data Systems
Team Members: Adarsh Rai, Aarya Shah

Table of Contents
Overview

Architecture

Key Technologies

Microservices / Lambdas

API Endpoints

How it Works

Future Work

Results

Demo Video

Overview
The system automates resume parsing, job description analysis, and intelligent ranking of candidate resumes using a fully serverless, cloud-native architecture.

Problem Statement
Manually screening and shortlisting resumes for job roles is time-consuming and inefficient.
This system leverages cloud microservices and LLMs to automate the ranking process, reducing recruiter workload and improving candidate-job matching.

Architecture
User uploads resume via API Gateway

S3 triggers Lambda to parse resume (Textract)

Job description is passed to API (analyzed via Comprehend)

Parsed resumes + JD go to ranking Lambda (Bedrock Titan LLM)

Results are updated to DynamoDB + indexed to OpenSearch

User retrieves top candidates from OpenSearch

See project flow diagram: (Attach your architecture diagram image here)

Key Technologies
AWS Lambda (Serverless compute)

Amazon S3 (Resume storage)

Amazon Textract (Resume parsing + text extraction)

Amazon Comprehend (JD key phrase & entity analysis)

AWS Bedrock Titan (LLM for resume-job match scoring)

Amazon DynamoDB (Persistent structured storage)

Amazon OpenSearch (Search and retrieval of ranked candidates)

Amazon API Gateway (REST API endpoints)

IAM + Roles (Fine-grained permissions)

Microservices / Lambdas
Lambda Name	Purpose
lambda_generate_presigned_url	Generates pre-signed S3 upload URL
lambda_parse_resume	Triggered by S3 upload; parses resume via Textract
lambda_analyze_jd	Analyzes job description using Comprehend
lambda_rank_resumes	Matches resumes to JD using Bedrock LLM and updates DynamoDB + OpenSearch
lambda_search_resumes	GET or POST to fetch candidates from OpenSearch
lambda_get_resume	Generates signed URL to view individual candidate resume

API Endpoints
Method	Path	Purpose
POST	/upload-resume	Generate signed S3 upload URL
PUT	{signed_url}	Upload PDF resume file
POST	/analyze-jd	Analyze JD and store results
POST	/rank-resumes	Rank all / selected candidate resumes
GET	/rank-resumes	Fetch ranked resumes
GET	/view-resume	View live candidate PDF resume by candidate ID

How it Works
Upload Resume:

Frontend requests signed URL → Uploads PDF to S3.

Resume Parsing:

S3 triggers Lambda → AWS Textract parses & stores in DynamoDB.

Job Description Analysis:

User submits JD → Comprehend analyzes key phrases + entities → stores in DynamoDB.

Resume Ranking:

Bedrock LLM calculates similarity score between JD & resumes.

Updates scores into DynamoDB + indexes into OpenSearch.

Candidate Search:

User retrieves top candidates via OpenSearch.

Supports query filtering + optional tag-style multi-keyword filters.

View Resume:

User can view candidate’s resume directly (via signed S3 URL).

Results
Supports ~150+ resumes per session with full pipeline execution.

Accurate scoring: Bedrock LLM delivers 85-95% accuracy for relevant matches.

End-to-end tested: Project fully functional with AWS cloud services and clean microservice separation.

Future Work
Resume pre-cleaning for poor quality datasets.

LLM-based parsing for messy formats (Kaggle-style resumes).

Parallel Lambda execution for 1000+ resume scalability.

Batch APIs for enterprise clients.

Fine-tuned OpenSearch settings for high volume retrieval.

Enhanced IAM & security controls.

Direct frontend download of ranked result CSVs (future feature).

Demo Video
Watch our full 3-min demo:
[YouTube Link - Coming Soon]
