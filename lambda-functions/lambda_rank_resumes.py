import boto3
import json
import os
from datetime import datetime
from sentence_transformers import SentenceTransformer, util
from requests.auth import HTTPBasicAuth
import requests

# === Will enable after full integration ===
# dynamodb = boto3.resource('dynamodb')
# resume_table = dynamodb.Table('Resumes')  # Primary key: candidate_id
# jd_table = dynamodb.Table('JobDescriptions')  # Primary key: job_id

model = SentenceTransformer('all-MiniLM-L6-v2')  # Sentence-BERT

# OPENSEARCH_ENDPOINT = os.environ.get('OPENSEARCH_ENDPOINT')  # Will be used later
# OPENSEARCH_AUTH = HTTPBasicAuth('admin', 'admin')  # Replace with actual credentials

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        job_desc = body['job_description']
        resumes = body['resumes']  # List of {id, text}

        rankings = []

        for res in resumes:
            score = util.cos_sim(
                model.encode(res['text'], convert_to_tensor=True),
                model.encode(job_desc, convert_to_tensor=True)
            ).item()

            rankings.append({
                'resume_id': res['id'],
                'score': round(score, 3)
            })

            # === DynamoDB write (will be enabled later) ===
            # resume_table.update_item(
            #     Key={'candidate_id': res['id']},
            #     UpdateExpression='SET Score = :s',
            #     ExpressionAttributeValues={':s': round(score, 3)}
            # )

            # === OpenSearch indexing (for fast querying later) ===
            # doc = {
            #     'resume_id': res['id'],
            #     'score': round(score, 3),
            #     'entities': [],  # Can be enriched later
            #     'resume_text': res['text'],
            #     'timestamp': datetime.utcnow().isoformat()
            # }
            # requests.post(f"{OPENSEARCH_ENDPOINT}/resumes/_doc", auth=OPENSEARCH_AUTH, json=doc)

        rankings.sort(key=lambda x: x['score'], reverse=True)

        return {
            'statusCode': 200,
            'body': json.dumps({'rankings': rankings})
        }

    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
