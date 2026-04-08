#!/bin/bash
set -e

export PATH="/usr/local/bin:$PATH"
export HOME="/root"

DATA_DIR="/data/minitia"

echo "=== Clash of Prompt — Starting ==="

# Check if chain data exists (already initialized)
if [ ! -d "$DATA_DIR/data" ]; then
  echo "[Init] First run — extracting chain data..."
  mkdir -p "$DATA_DIR"
  tar xzf /app/deploy/minitia-full.tar.gz -C "$DATA_DIR/"
  echo "[Init] Chain data extracted"
fi

# Start minitia
echo "[Start] Starting minitia node..."
minitiad start --home "$DATA_DIR" \
  --api.enable true \
  --api.address tcp://0.0.0.0:1317 \
  --rpc.laddr tcp://0.0.0.0:26657 \
  --p2p.laddr tcp://0.0.0.0:26656 \
  2>&1 &
MINITIA_PID=$!

# Wait for RPC
echo "[Start] Waiting for minitia..."
for i in $(seq 1 120); do
  if curl -s http://localhost:26657/status > /dev/null 2>&1; then
    echo "[Start] Minitia ready! (${i}s)"
    break
  fi
  if ! kill -0 $MINITIA_PID 2>/dev/null; then
    echo "[Error] Minitia crashed"
    exit 1
  fi
  sleep 1
done

# Get operator address
OPERATOR_ADDR=$(minitiad keys show operator -a --keyring-backend test --home "$DATA_DIR" 2>/dev/null || echo "unknown")
echo "[Start] Operator: $OPERATOR_ADDR"

# Start backend
echo "[Backend] Starting..."
cd /app/backend

export MINITIA_LCD_URL=http://localhost:1317
export MINITIA_CHAIN_ID=clashofprompt-1
export MODULE_ADDRESS="$OPERATOR_ADDR"
export CHAIN_KEY_NAME="operator"
export MINITIA_HOME="$DATA_DIR"
export PORT=8080

exec node dist/server.js
