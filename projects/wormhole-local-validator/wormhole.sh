#!/usr/bin/env bash

set -euo pipefail

# Start guardiand

npx pm2 stop guardiand 2> /dev/null || true
npx pm2 start './guardiand.sh' --name guardiand
