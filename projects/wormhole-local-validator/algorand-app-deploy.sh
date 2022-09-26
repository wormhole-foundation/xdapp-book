#!/usr/bin/env bash

echo "Starting algorand docker containers"
$SANDBOX up dev

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

echo -n $core_app_id > .algorand_app_id

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
