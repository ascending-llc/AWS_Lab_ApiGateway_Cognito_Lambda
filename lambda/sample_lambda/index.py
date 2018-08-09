def lambda_handler(event, context):

	return {
		'statusCode': 200,
		'body': 'My IP address is ' + event["requestContext"]["identity"]["sourceIp"],
		'headers': {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
		},
	}