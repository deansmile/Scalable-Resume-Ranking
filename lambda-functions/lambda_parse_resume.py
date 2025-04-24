import boto3
import json
import uuid
from datetime import datetime

s3 = boto3.client('s3')
textract = boto3.client('textract')
# dynamodb = boto3.resource('dynamodb')
# DDB_TABLE = 'Resumes'  # Replace with your actual table name

def lambda_handler(event, context):
    try:
        # S3 trigger input
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']

        # Textract: extract text from resume PDF
        response = textract.detect_document_text(
            Document={'S3Object': {'Bucket': bucket, 'Name': key}}
        )

        # Combine all lines into one string
        text = ' '.join([
            block['Text'] for block in response['Blocks']
            if block['BlockType'] == 'LINE'
        ])

        # ✅ Log output for testing (first 500 chars)
        print("===== TEXTRACT PARSED TEXT (First 500 chars) =====")
        print(text[:500])
        print("===================================================")

        # ❌ DynamoDB integration is disabled for now (uncomment later when table exists)
        # table = dynamodb.Table(DDB_TABLE)
        # resume_id = str(uuid.uuid4())
        # table.put_item(Item={
        #     'ResumeID': resume_id,
        #     'S3Key': key,
        #     'ParsedText': text,
        #     'Timestamp': datetime.utcnow().isoformat()
        # })

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Textract success!'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
