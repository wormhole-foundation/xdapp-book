#!/usr/bin/env bash

set -euo pipefail

# Start guardiand

npx pm2 delete guardiand 2> /dev/null || true
npx pm2 start './guardiand.sh' --name guardiand
