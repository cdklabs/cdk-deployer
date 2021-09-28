"""
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
"""

import boto3

client = boto3.client('codedeploy')

def on_event(event, context):
  print(f'Event: {event}')

  request_type = event['RequestType']
  if request_type == 'Create' or request_type == 'Update': return handle_event(event)
  if request_type == 'Delete': return
  raise Exception(f"Invalid request type: {request_type}")

def handle_event(event):
  # don't need to deploy if ResourceProperties haven't changed
  if (event['RequestType'] == 'Update' and event['OldResourceProperties'] == event['ResourceProperties']):
    print('Skipping deployment--ResourceProperties did not change.')
    return

  application_name = event['ResourceProperties'].get('applicationName')
  deployment_group_name = event['ResourceProperties'].get('deploymentGroupName')
  code_bucket_name = event['ResourceProperties'].get('codeS3BucketName')
  code_object_key = event['ResourceProperties'].get('codeS3ObjectKey')
  code_object_version = event['ResourceProperties'].get('codeS3ObjectVersion')

  print(f'Application Name: {application_name}')
  print(f'Deployment Group Name: {deployment_group_name}')
  print(f'Code Bucket Name: {code_bucket_name}')
  print(f'Code Object Key: {code_object_key}')
  print(f'Code Object Version: {code_object_version}')

  revision={
    'revisionType': 'S3',
    's3Location': {
      'bucket': code_bucket_name,
      'key': code_object_key,
      'bundleType': 'zip'
    }
  }

  if code_object_version:
    revision['s3Location']['version'] = code_object_version

  response = client.create_deployment(
    applicationName=application_name,
    deploymentGroupName=deployment_group_name,
    revision=revision
  )
  
  print(f'Create Deployment Response: {response}')

  returnValue = {
    'PhysicalResourceId': response['deploymentId']
  }
  print(f'Return: {returnValue}')
  return returnValue

def is_complete(event, context):
  print(f'Event: {event}')

  request_type = event['RequestType']
  if request_type == 'Create' or request_type == 'Update': return handle_is_complete(event)
  if request_type == 'Delete': return { 'IsComplete': True }
  raise Exception(f"Invalid request type: {request_type}")

def handle_is_complete(event):
  deployment_id = event['PhysicalResourceId']

  print(f'Deployment ID: {deployment_id}')

  response = client.get_deployment(
    deploymentId=deployment_id
  )

  print(f'Response: {response}')

  status = response['deploymentInfo']['status']
  print(f'Deployment Status: {status}')

  if (status == 'Failed' or status == 'Stopped'):
    error_code = response['deploymentInfo'].get('errorInformation').get('code')
    error_message = response['deploymentInfo'].get('errorInformation').get('message')
    raise RuntimeError(f'Deployment {status} - {error_code}: {error_message}')

  is_ready = status == 'Succeeded'

  returnValue = { 'IsComplete': is_ready }
  print(f'Return: {returnValue}')
  return returnValue
