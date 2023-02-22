#!/usr/bin/env bash
# Run Guardiand

set -euo pipefail

# main for now (until we make a release)
DOCKER_IMAGE="ghcr.io/wormhole-foundation/guardiand:latest"

DOCKER_FLAGS="-p 7070:7070 -p 7071:7071 -p 6060:6060 -p 8999:8999/udp --add-host=host.docker.internal:host-gateway --platform linux/amd64"
HOST="host.docker.internal"
TERRAD_HOST="host.docker.internal"


docker run --rm --name guardiand $DOCKER_FLAGS --hostname guardian-0 --cap-add=IPC_LOCK "$DOCKER_IMAGE" node \
    --unsafeDevMode --guardianKey /bridge.key --publicRPC "[::]:7070" --publicWeb "[::]:7071" --publicGRPCSocket /publicGRPC.sock --adminSocket /admin.sock --dataDir /data \
    --ethRPC ws://$HOST:8545 \
    --ethContract "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550" \
    --bscRPC ws://$HOST:8546 \
    --bscContract "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550" \
    --polygonRPC ws://$HOST:8545 \
    --avalancheRPC ws://$HOST:8545 \
    --arbitrumRPC ws://$HOST:8545 \
    --optimismContract "" \
    --optimismRPC ws://$HOST:8545 \
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
    --solanaRPC http://$HOST:8899 \
    --algorandIndexerRPC ws://$HOST:8545 \
    --algorandIndexerToken "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" \
    --algorandAlgodToken "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" \
    --algorandAlgodRPC https://$HOST:4001 \
    --algorandAppID "4" \
    --aptosRPC http://$HOST:8080 \
    --aptosAccount "de0036a9600559e295d5f6802ef6f3f802f510366e0c23912b0655d972166017" \
    --aptosHandle "0xde0036a9600559e295d5f6802ef6f3f802f510366e0c23912b0655d972166017::state::WormholeMessageHandle"
