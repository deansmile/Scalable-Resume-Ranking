import boto3
import json
import uuid
from datetime import datetime
from decimal import Decimal

comprehend = boto3.client('comprehend')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
DDB_TABLE = 'JobDescriptions'

# Helper to convert all float values to Decimal (required for DynamoDB)
def convert_floats(obj):
    if isinstance(obj, list):
        return [convert_floats(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: convert_floats(v) for k, v in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    else:
        return obj

def lambda_handler(event, context):
    try:
        # Accept both direct Lambda test events and API Gateway POST body
        body = json.loads(event['body']) if "body" in event else event
        job_description = body['job_description']
        job_id = body.get('job_id', str(uuid.uuid4()))  # ✅ Optional custom ID

        key_phrases = comprehend.detect_key_phrases(Text=job_description, LanguageCode='en')
        entities = comprehend.detect_entities(Text=job_description, LanguageCode='en')

        # ✅ Write to DynamoDB
        table = dynamodb.Table(DDB_TABLE)
        table.put_item(Item={
            'job_id': job_id,
            'description': job_description,
            'key_phrases': convert_floats(key_phrases['KeyPhrases']),
            'entities': convert_floats(entities['Entities']),
            'timestamp': datetime.utcnow().isoformat()
        })

        return {
            'statusCode': 200,
            'body': json.dumps({
                'job_id': job_id,
                'key_phrases': key_phrases['KeyPhrases'],
                'entities': entities['Entities']
            }),
            'headers': {
                'Access-Control-Allow-Origin': '*'
            }
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
