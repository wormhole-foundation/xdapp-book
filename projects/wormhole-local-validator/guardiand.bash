#!/usr/bin/env bash
# Run Guardiand

set -euo pipefail

# dev.v2 for now (until we make a release)
DOCKER_IMAGE="ghcr.io/certusone/guardiand:dev.v2"

DOCKER_FLAGS=
HOST=
TERRAD_HOST=
if [ "$(uname -m)" = "arm64" ]; then
   DOCKER_FLAGS="-p 7070:7070 -p 7071:7071 -p 7073:7073 --platform linux/amd64"
   HOST="host.docker.internal"
   TERRAD_HOST="host.docker.internal"
else
   DOCKER_FLAGS="--network host"
   TERRAD_HOST="terra-terrad"
   HOST="localhost"
fi

docker run --rm --name guardiand $DOCKER_FLAGS --hostname guardian-0 --cap-add=IPC_LOCK "$DOCKER_IMAGE" node \
    --unsafeDevMode --guardianKey /bridge.key --publicRPC "[::]:7070" --publicWeb "[::]:7071" --adminSocket /admin.sock --dataDir /data \
    --ethRPC ws://$HOST:8545 \
    --ethContract "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550" \
    --bscRPC ws://$HOST:8546 \
    --bscContract "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550" \
    --polygonRPC ws://$HOST:8545 \
    --avalancheRPC ws://$HOST:8545 \
    --auroraRPC ws://$HOST:8545 \
    --fantomRPC ws://$HOST:8545 \
    --oasisRPC ws://$HOST:8545 \
    --karuraRPC ws://$HOST:8545 \
    --acalaRPC ws://$HOST:8545 \
    --klaytnRPC ws://$HOST:8545 \
    --celoRPC ws://$HOST:8545 \
    --moonbeamRPC ws://$HOST:8545 \
    --neonRPC ws://$HOST:8545 \
    --terraWS ws://$HOST:8545 \
    --terra2WS ws://$HOST:8545 \
    --terraLCD https://$TERRAD_HOST:1317 \
    --terra2LCD http://$HOST:1317  \
    --terraContract terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5 \
    --terra2Contract terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5 \
    --solanaContract Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o \
    --pythnetContract Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o \
    --solanaWS ws://$HOST:8900 \
    --solanaRPC http://$HOST:8899 \
    --algorandIndexerRPC ws://$HOST:8545 \
    --algorandIndexerToken "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" \
    --algorandAlgodToken "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" \
    --algorandAlgodRPC https://$HOST:4001 \
    --algorandAppID "4"
