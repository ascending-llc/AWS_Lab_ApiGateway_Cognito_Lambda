import json

def lambda_handler(event, context):

	# return event["requestContext"]["identity"]["sourceIp"]

	return json.dump(event)