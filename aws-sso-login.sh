#!/bin/bash

export AWS_PROFILE=vrama-root

echo "Logging into AWS SSO account $AWS_PROFILE..."

CALLER_IDENTITY=$(aws sts get-caller-identity)
ERROR_STRING="Error loading SSO Token: The SSO access token has either expired or is otherwise invalid."

if echo $CALLER_IDENTITY | grep -q "$ERROR_STRING"; then
  echo "SSO token expired, logging in again..."
  aws sso login --profile $AWS_PROFILE
fi

ssocreds -p $AWS_PROFILE
