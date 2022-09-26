#!/usr/bin/env bash

set -euo pipefail

# Env vars so we don't typo

ALGORAND_ARTIFACTS=./algorand-artifacts
ALGORAND_SANDBOX=./algorand-local

CORE_APPROVAL_NAME=core_approve.teal
CORE_CLEAR_NAME=core_clear.teal

TOKEN_APPROVAL_NAME=token_approve.teal
TOKEN_CLEAR_NAME=token_clear.teal

SANDBOX="$ALGORAND_SANDBOX/sandbox"
GOAL="$SANDBOX goal"

# Check if algorand-local/ directory exists.
# If it doesn't then clone
if [ ! -d "./algorand-local" ] 
then
    git clone https://github.com/algorand/sandbox $ALGORAND_SANDBOX 
    cp $ALGORAND_ARTIFACTS/config.dev $ALGORAND_SANDBOX 
fi

echo "Starting algorand docker containers"
#$SANDBOX up dev

echo "Copying program source files"
# Copy core locally
cp ./wormhole/algorand/teal/$CORE_APPROVAL_NAME $ALGORAND_ARTIFACTS
cp ./wormhole/algorand/teal/$CORE_CLEAR_NAME $ALGORAND_ARTIFACTS
# Copy core into algorand docker container
$SANDBOX copyTo $ALGORAND_ARTIFACTS/$CORE_APPROVAL_NAME 
$SANDBOX copyTo $ALGORAND_ARTIFACTS/$CORE_CLEAR_NAME

# Copy token bridge locally
cp ./wormhole/algorand/teal/$TOKEN_APPROVAL_NAME $ALGORAND_ARTIFACTS
cp ./wormhole/algorand/teal/$TOKEN_CLEAR_NAME $ALGORAND_ARTIFACTS
# Copy token bridge into algorand docker container
$SANDBOX copyTo $ALGORAND_ARTIFACTS/$TOKEN_APPROVAL_NAME 
$SANDBOX copyTo $ALGORAND_ARTIFACTS/$TOKEN_CLEAR_NAME

echo "Creating apps"

ADMIN=IBORJJKUKHXDPDGIVIRUXTTQT53KEPERB5CPFXU4H4QLYXSK3JVOP62DD4

# Create core app
core_app_id=`$GOAL app create --creator $ADMIN \
        --approval-prog $CORE_APPROVAL_NAME \
        --clear-prog $CORE_CLEAR_NAME\
        --extra-pages 2 \
        --global-byteslices 40 \
        --global-ints 8 \
        --local-ints 0 \
        --local-byteslices 16  | grep 'Created app' |awk '{print $6}' | tr -d '\r'`


core_app_addr=`$GOAL app info --app-id=$core_app_id | grep 'Application account:' | awk '{print $3}' | tr -d '\r'`
echo "Created core app at id: $core_app_id with address $core_app_addr"


# Create token bridge 
token_app_id=`$GOAL app create --creator $ADMIN \
        --approval-prog $TOKEN_APPROVAL_NAME \
        --clear-prog $TOKEN_CLEAR_NAME \
        --extra-pages 2 \
        --global-byteslices 30 \
        --global-ints 4 \
        --local-ints 0 \
        --local-byteslices 16 \
        --app-arg "int:$core_app_id" \
        --app-arg "str:$core_app_addr" | grep 'Created app' |awk '{print $6}' | tr -d '\r'`

echo "Created token bridge app at id: $token_app_id"