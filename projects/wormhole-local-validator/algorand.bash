#!/usr/bin/env bash

set -euo pipefail

# Env vars for startup and app deploy 

# Hardcode admin address so we have 1 well known, funded address 
export ADMIN="D4VWVAR7C2RDKHIIVSU5QT23IE72YLNOE7QXELJBEEUDZ5ZQ6WCDUH7HI4"
export ADMIN_MN="champion phrase myth stage into crater sad captain cigar right stable wood wear dance armor kick shiver attract alter toilet intact hen general abandon oak"

export ALGORAND_ARTIFACTS=./algorand-artifacts
export ALGORAND_SANDBOX=./algorand-local
export CORE_APPROVAL_NAME=core_approve.teal
export CORE_CLEAR_NAME=core_clear.teal
export TOKEN_APPROVAL_NAME=token_approve.teal
export TOKEN_CLEAR_NAME=token_clear.teal
export SANDBOX="$ALGORAND_SANDBOX/sandbox"
export GOAL="$SANDBOX goal"

# Check if algorand-local/ directory exists.
# If it doesn't then clone
if [ ! -d "./algorand-local" ] 
then
    git clone https://github.com/algorand/sandbox $ALGORAND_SANDBOX 
    cp $ALGORAND_ARTIFACTS/config.dev $ALGORAND_SANDBOX 
fi


npx pm2 delete algorand 2> /dev/null || true
npx pm2 start "bash algorand-app-deploy.sh" --name algorand