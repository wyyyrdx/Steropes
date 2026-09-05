import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import datetime, timedelta, timezone

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('DecisionEvents')


def decimal_to_native(obj):
    if isinstance(obj, list):
        return [decimal_to_native(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: decimal_to_native(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    else:
        return obj


def lambda_handler(event, context):
    try:
        path = event.get('path', '')
        query_params = event.get('queryStringParameters') or {}
        path_params = event.get('pathParameters') or {}

        # GET /events/latest
        if path.endswith('/latest'):
            return get_latest(query_params)

        # GET /events/{request_id}
        elif path_params.get('request_id'):
            return get_by_request_id(path_params['request_id'])

        # GET /stats
        elif path.endswith('/stats'):
            return get_stats(query_params)

        # GET /events?from=&to=
        else:
            return get_by_date_range(query_params)

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def get_latest(query_params):
    limit = int(query_params.get('limit', 20))
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    response = table.query(
        KeyConditionExpression=Key('PK').eq(f'EVENT#{today}'),
        ScanIndexForward=False,
        Limit=limit
    )

    items = decimal_to_native(response.get('Items', []))
    return {
        'statusCode': 200,
        'body': json.dumps({'events': items, 'count': len(items)})
    }


def get_by_date_range(query_params):
    from_date = query_params.get('from')
    to_date = query_params.get('to')

    if not from_date or not to_date:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'from and to query params are required (format: YYYY-MM-DD)'})
        }

    start = datetime.strptime(from_date, '%Y-%m-%d')
    end = datetime.strptime(to_date, '%Y-%m-%d')

    all_items = []
    current = start
    while current <= end:
        date_str = current.strftime('%Y-%m-%d')
        response = table.query(
            KeyConditionExpression=Key('PK').eq(f'EVENT#{date_str}')
        )
        all_items.extend(response.get('Items', []))
        current += timedelta(days=1)

    items = decimal_to_native(all_items)
    return {
        'statusCode': 200,
        'body': json.dumps({'events': items, 'count': len(items)})
    }


def get_by_request_id(request_id):
    # Uses GSI-1 (request_id-index)
    response = table.query(
        IndexName='request_id-index',
        KeyConditionExpression=Key('request_id').eq(request_id)
    )

    items = decimal_to_native(response.get('Items', []))
    if not items:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'request_id not found'})
        }

    return {
        'statusCode': 200,
        'body': json.dumps({'events': items})
    }


def get_stats(query_params):
    from_date = query_params.get('from')
    to_date = query_params.get('to')

    if not from_date or not to_date:
        today = datetime.now(timezone.utc)
        from_date = today.strftime('%Y-%m-%d')
        to_date = from_date

    # Build ISO timestamp bounds for the date range to filter the GSI sort key
    start_bound = f'{from_date}T00:00:00'
    end_bound = f'{to_date}T23:59:59'

    tier_counts = {1: 0, 2: 0, 3: 0}
    cost_avoided_count = 0
    total_count = 0

    # Uses GSI-2 (tier_resolved-index) - one query per tier instead of
    # scanning every day in the range and counting manually
    for tier in [1, 2, 3]:
        response = table.query(
            IndexName='tier_resolved-index',
            KeyConditionExpression=Key('tier_resolved').eq(tier) &
                                   Key('timestamp').between(start_bound, end_bound)
        )
        items = response.get('Items', [])
        tier_counts[tier] = len(items)
        total_count += len(items)
        cost_avoided_count += sum(1 for item in items if item.get('cloud_cost_avoided'))

    return {
        'statusCode': 200,
        'body': json.dumps({
            'total_events': total_count,
            'tier_breakdown': tier_counts,
            'cost_avoided_count': cost_avoided_count,
            'cost_avoided_percentage': round((cost_avoided_count / total_count * 100), 2) if total_count > 0 else 0
        })
    }