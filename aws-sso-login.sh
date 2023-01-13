#!/bin/bash

AWS_PROFILE=vrama-root

echo "Logging into AWS SSO account $AWS_PROFILE..."

CALLER_IDENTITY=$(aws sts get-caller-identity --profile ${AWS_PROFILE})
echo $CALLER_IDENTITY

if echo "$CALLER_IDENTITY" | grep -q "InvalidClientTokenId"; then
    echo "Access token is invalid, exiting..."
    exit 1
elif echo "$CALLER_IDENTITY" | grep -q "ExpiredToken"; then
    echo "Access token is expired, logging in via SSO..."
fi

export AWS_PROFILE=$AWS_PROFILE

aws sso login --profile $AWS_PROFILE

ssocreds -p $AWS_PROFILE
