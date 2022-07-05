#!/usr/bin/env bash

# Start guardiand

npx pm2 stop guardiand
npx pm2 start './guardiand.sh' --name guardiand
