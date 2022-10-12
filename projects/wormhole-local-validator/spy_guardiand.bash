#!/usr/bin/env bash
# Run Guardiand

set -euo pipefail

# dev.v2 for now (until we make a release)
DOCKER_IMAGE="ghcr.io/certusone/guardiand:dev.v2"

HOST=
if [ "$(uname -m)" = "arm64" ]; then
   HOST="host.docker.internal"
else
   HOST="localhost"
fi

docker run \
    --platform=linux/amd64 \
    -p 7073:7073 \
    --entrypoint /guardiand \
    ghcr.io/wormhole-foundation/guardiand:latest \
spy --nodeKey /node.key --spyRPC "[::]:7073" --bootstrap /dns4/${HOST}/udp/8999/quic/p2p/12D3KooWL3XJ9EMCyZvmmGXL2LMiVBtrVa2BuESsJiXkSj7333Jw