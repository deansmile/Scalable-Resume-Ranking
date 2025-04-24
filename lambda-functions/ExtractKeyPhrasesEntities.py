import boto3
import json

# Initialize the Comprehend client
comprehend = boto3.client('comprehend')

def lambda_handler(event, context):
    # Extract the resume text from the event
    resume_text = event['resume_text']

    # Detect key phrases
    key_phrases_response = comprehend.detect_key_phrases(
        Text=resume_text,
        LanguageCode='en'
    )
    key_phrases = key_phrases_response['KeyPhrases']

    # Detect entities
    entities_response = comprehend.detect_entities(
        Text=resume_text,
        LanguageCode='en'
    )
    entities = entities_response['Entities']

    # Prepare the response
    response = {
        'key_phrases': key_phrases,
        'entities': entities
    }

    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }
