import boto3
import json
from datetime import datetime
import re
from collections import defaultdict
import uuid

# === AWS Clients ===
s3 = boto3.client('s3')
textract = boto3.client('textract')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
DDB_TABLE = 'Resumes'

COMMON_HEADINGS = {
    "education", "experience", "work experience", "skills", "projects",
    "technical skills", "certifications", "achievements", "summary", "interests"
}

def is_heading(line):
    text = line.strip().lower()
    if len(text.split()) > 6:
        return False
    if re.match(r'^[A-Z\s]{4,}$', line):
        return True
    for heading in COMMON_HEADINGS:
        if heading in text:
            return True
    return False

def normalize_heading(text):
    text = text.strip().lower()
    if "experience" in text:
        return "EXPERIENCE"
    elif "education" in text:
        return "EDUCATION"
    elif "skill" in text:
        return "SKILLS"
    elif "project" in text:
        return "PROJECTS"
    elif "certification" in text:
        return "CERTIFICATIONS"
    elif "achievement" in text:
        return "ACHIEVEMENTS"
    elif "summary" in text:
        return "SUMMARY"
    elif "interest" in text:
        return "INTERESTS"
    else:
        return text.upper()

def parse_by_headings(raw_text):
    lines = raw_text.splitlines()
    sections = defaultdict(list)
    current_section = "UNKNOWN"

    for line in lines:
        line = line.strip()
        if not line:
            continue
        if is_heading(line):
            current_section = normalize_heading(line)
        else:
            sections[current_section].append(line)

    return {sec: '\n'.join(body) for sec, body in sections.items()}

def extract_contact_info(text):
    name = text.split('\n')[0] if text else ""
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    phone_match = re.search(r'(\+?\d[\d\s\-\(\)]{7,}\d)', text)

    return {
        'name': name.strip(),
        'email': email_match.group(0) if email_match else "",
        'phone': phone_match.group(0) if phone_match else ""
    }

def lambda_handler(event, context):
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']   # 👈 original file name

        if not key.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png')):
            raise ValueError("Unsupported file type")

        response = textract.detect_document_text(
            Document={'S3Object': {'Bucket': bucket, 'Name': key}}
        )

        text = '\n'.join([
            block['Text'] for block in response['Blocks']
            if block['BlockType'] == 'LINE'
        ])

        parsed_sections = parse_by_headings(text)
        contact_info = extract_contact_info(text)

        table = dynamodb.Table(DDB_TABLE)

        # ✅ Safe fallback check for candidate_id
        result = table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('original_filename').eq(key)
        )

        if result['Items']:
            candidate_id = result['Items'][0]['candidate_id']  # ✅ Found
        else:
            candidate_id = str(uuid.uuid4())  # ✅ Create new if not found
            print(f"New candidate_id generated: {candidate_id}")

        # ✅ Always upsert
        table.put_item(Item={
            'candidate_id': candidate_id,
            's3_key': key,
            'original_filename': key,
            'raw_text': text,
            'parsed_sections': parsed_sections,
            'name': contact_info['name'],
            'email': contact_info['email'],
            'phone': contact_info['phone'],
            'timestamp': datetime.utcnow().isoformat()
        })

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Resume parsed + stored successfully',
                'candidate_id': candidate_id
            })
        }

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
