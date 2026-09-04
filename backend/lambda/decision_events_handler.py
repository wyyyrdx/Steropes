import json
import boto3
import uuid
from datetime import datetime, timezone
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('DecisionEvents')


def convert_floats_to_decimal(obj):
    if isinstance(obj, list):
        return [convert_floats_to_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_floats_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    else:
        return obj


def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))

        request_id = body.get('request_id', str(uuid.uuid4()))
        tier_resolved = body.get('tier_resolved')
        confidence_breakdown = body.get('confidence_breakdown', {})
        action_taken = body.get('action_taken')
        cloud_cost_avoided = body.get('cloud_cost_avoided', False)
        timestamp = body.get('timestamp', datetime.now(timezone.utc).isoformat())

        if tier_resolved is None or action_taken is None:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'tier_resolved and action_taken are required'})
            }

        date_part = timestamp.split('T')[0]

        item = {
            'PK': f'EVENT#{date_part}',
            'SK': f'{timestamp}#{request_id}',
            'request_id': request_id,
            'tier_resolved': tier_resolved,
            'confidence_breakdown': convert_floats_to_decimal(confidence_breakdown),
            'action_taken': action_taken,
            'cloud_cost_avoided': cloud_cost_avoided,
            'timestamp': timestamp
        }

        table.put_item(Item=item)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Event stored', 'request_id': request_id})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
