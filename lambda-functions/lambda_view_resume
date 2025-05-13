import boto3
import json
import os

# === AWS Clients ===
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
resume_table = dynamodb.Table('Resumes')

# === S3 Bucket Name (same as your upload bucket) ===
S3_BUCKET_NAME = 'resume-upload-storage'  # 🔥 replace with your actual bucket name

# === Lambda Entry Point ===
def lambda_handler(event, context):
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        candidate_id = query_params.get('candidate_id', '')

        if not candidate_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing candidate_id parameter'})
            }

        # ✅ Lookup resume in DynamoDB
        response = resume_table.get_item(Key={'candidate_id': candidate_id})
        item = response.get('Item')

        if not item:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': f'Resume not found for candidate_id: {candidate_id}'})
            }

        s3_key = item.get('s3_key', '')
        if not s3_key:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 's3_key missing in DynamoDB for candidate'})
            }

        # ✅ Generate pre-signed URL for viewing
        presigned_url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': s3_key},
            ExpiresIn=600  # URL valid for 10 minutes
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'candidate_id': candidate_id, 'view_url': presigned_url}),
            'headers': {
                'Access-Control-Allow-Origin': '*'
            }
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
