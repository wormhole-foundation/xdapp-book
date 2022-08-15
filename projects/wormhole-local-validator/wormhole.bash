#!/usr/bin/env bash

set -euo pipefail

# Check if Docker is running
if [ ! $(docker ps > /dev/null 2>&1) ]; then
    echo "ERROR: Please start docker and try this command again."
    exit 3
fi


# Start guardiand
#npx pm2 delete guardiand 2> /dev/null || true
#npx pm2 start 'bash guardiand.bash' --name guardiand
