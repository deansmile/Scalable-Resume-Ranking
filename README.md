# AWS Serverless Resume Ranking System

_AWS Serverless Intelligent Resume Ranking System using Lambda, Textract, Comprehend, Bedrock LLM, DynamoDB, and OpenSearch._

---

## 👥 Team
**NYU | Cloud Computing and Big Data Systems**  
**Team Members:** Adarsh Rai, Aarya Shah, Dean Sheng, Angjelo Gioni, Kartik Deori

---

## 📋 Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Architecture](#architecture)
- [Key Technologies](#key-technologies)
- [Microservices / Lambdas](#microservices--lambdas)
- [API Endpoints](#api-endpoints)
- [How it Works](#how-it-works)
- [Results](#results)
- [Future Work](#future-work)
- [Demo Video](#demo-video)

---

## 📝 Overview
The system automates resume parsing, job description analysis, and intelligent ranking of candidate resumes using a fully serverless, cloud-native architecture.

---

## 🎯 Problem Statement
Manually screening and shortlisting resumes for job roles is time-consuming and inefficient.
This system leverages cloud microservices and LLMs to automate the ranking process, reducing recruiter workload and improving candidate-job matching.

---

## 🏛️ Architecture
1. User uploads resume via API Gateway.
2. S3 triggers Lambda to parse resume (Textract).
3. Job description is passed to API (analyzed via Comprehend).
4. Parsed resumes + JD go to ranking Lambda (Bedrock Titan LLM).
5. Results updated to DynamoDB + indexed to OpenSearch.
6. User retrieves top candidates from OpenSearch.

_**(Attach architecture diagram image here)**_

---

## 🛠️ Key Technologies
- AWS Lambda (Serverless compute)
- Amazon S3 (Resume storage)
- Amazon Textract (Resume parsing + text extraction)
- Amazon Comprehend (JD key phrase & entity analysis)
- AWS Bedrock Titan (LLM for resume-job match scoring)
- Amazon DynamoDB (Persistent structured storage)
- Amazon OpenSearch (Candidate search and retrieval)
- Amazon API Gateway (REST API endpoints)
- IAM + Roles (Fine-grained permissions)

---

## 🧩 Microservices / Lambdas
| Lambda Name | Purpose |
|-------------|---------|
| `lambda_generate_presigned_url` | Generates pre-signed S3 upload URL |
| `lambda_parse_resume` | Parses resume using Textract |
| `lambda_analyze_jd` | Analyzes JD using Comprehend |
| `lambda_rank_bedrock` | Scores resumes with Bedrock LLM, updates DynamoDB & OpenSearch |
| `lambda_search_resumes` | Retrieves candidates from OpenSearch |
| `lambda_view_resume` | Generates signed S3 URL for candidate resume |

---

## 🌐 API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/upload-resume` | Generate signed S3 upload URL |
| PUT | `{signed_url}` | Upload PDF resume file |
| POST | `/analyze-jd` | Analyze JD and store results |
| POST | `/rank-resumes` | Rank candidate resumes |
| GET | `/rank-resumes` | Fetch ranked resumes |
| GET | `/view-resume` | View candidate PDF by ID |

---

## 🔎 How it Works
**1️⃣ Upload Resume:**  
Frontend requests signed URL → Uploads PDF to S3.

**2️⃣ Resume Parsing:**  
S3 triggers Lambda → AWS Textract parses & stores data.

**3️⃣ Job Description Analysis:**  
User submits JD → Comprehend extracts key data → stores in DynamoDB.

**4️⃣ Resume Ranking:**  
Bedrock LLM calculates match scores between JD and resumes → Updates scores to DynamoDB + OpenSearch.

**5️⃣ Candidate Search:**  
User retrieves top candidates from OpenSearch with query filtering.

**6️⃣ View Resume:**  
User views resume via signed S3 URL.

---

## 📝 Results
- Successfully supports ~150+ resumes per session.
- Bedrock LLM delivers ~85-95% accuracy in matching.
- Fully tested end-to-end with clean microservices separation.

---

## 🚀 Future Work
- Resume pre-cleaning for low-quality datasets.
- LLM-based parsing for unstructured formats.
- Parallel Lambda execution for 1000+ resume scalability.
- Batch APIs for enterprise usage.
- Fine-tune OpenSearch settings for high-volume retrieval.
- Enhanced IAM & security controls.
- Enable frontend download of ranked result CSVs.

---

## 🎥 Demo Video
Watch the full demo [here](#) _(Link coming soon)_

---
