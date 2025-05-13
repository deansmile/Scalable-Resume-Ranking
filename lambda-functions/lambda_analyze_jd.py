import boto3
import json
import uuid
from datetime import datetime

comprehend = boto3.client('comprehend')
# dynamodb = boto3.resource('dynamodb')  # Will enable after DynamoDB table setup
# DDB_TABLE = 'JobDescriptions'  # Placeholder for future use

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        job_description = body['job_description']
        job_id = str(uuid.uuid4())

        key_phrases = comprehend.detect_key_phrases(Text=job_description, LanguageCode='en')
        entities = comprehend.detect_entities(Text=job_description, LanguageCode='en')

        # === Skipping DynamoDB write for now ===
        # table = dynamodb.Table(DDB_TABLE)
        # table.put_item(Item={
        #     'JobID': job_id,
        #     'Description': job_description,
        #     'KeyPhrases': key_phrases['KeyPhrases'],
        #     'Entities': entities['Entities'],
        #     'Timestamp': datetime.utcnow().isoformat()
        # })

        return {
            'statusCode': 200,
            'body': json.dumps({
                'job_id': job_id,
                'key_phrases': key_phrases['KeyPhrases'],
                'entities': entities['Entities']
            })
        }

    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
