#!/usr/bin/env bash

# Check if wormhole/ repo exists.
# If it doesn't then clone
if [ ! -d "./wormhole" ] 
then
    git clone https://github.com/wormhole-foundation/wormhole
    cd wormhole/clients/js
    make install
    cd ../../../
fi
