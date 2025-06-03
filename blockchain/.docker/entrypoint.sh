#!/bin/bash
set -e

# Start anvil in background
anvil --host 0.0.0.0 --state /data &
ANVIL_PID=$!

# Wait a bit for anvil to start
sleep 2

echo "Deploying contract..."
forge script script/Deploy.s.sol:Dev --broadcast -vvv

# Wait on anvil process to keep container alive
wait $ANVIL_PID