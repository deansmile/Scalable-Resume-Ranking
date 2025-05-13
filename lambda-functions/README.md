# Lambda Functions

This folder contains the core AWS Lambda functions used in the Scalable Resume Ranking system:

- `lambda_parse_resume.py`: Extracts text from uploaded resumes using AWS Textract.
- `lambda_analyze_jd.py`: Uses AWS Comprehend to extract key phrases and entities from job descriptions.
- `lambda_rank_resumes.py`: Computes semantic similarity between resumes and job descriptions using Sentence-BERT.
- `ExtractKeyPhrasesEntities.py`: A modular Comprehend parser used for isolated testing.

All Lambda functions are designed to be stateless and integrate with AWS services via API Gateway triggers.
