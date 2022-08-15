#!/usr/bin/env bash

set -euo pipefail

# Check if Docker is running
docker ps > /dev/null #route error to console
echo "Docker is running"

# Start guardiand
npx pm2 delete guardiand 2> /dev/null || true
npx pm2 start 'bash guardiand.bash' --name guardiand
