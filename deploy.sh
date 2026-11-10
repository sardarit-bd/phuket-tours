#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/phuket-tours-staging"
APP_NAME="phuket-tours-staging"
PORT="3003"

cd "$APP_DIR"

# Preserve VPS-specific environment settings before Git synchronization.
if [ -f .env.production ] && [ ! -f .env.production.local ]; then
  cp .env.production .env.production.local
  chmod 600 .env.production.local
fi

echo "==> Fetching latest main branch"
git fetch origin main
git reset --hard origin/main

echo "==> Installing dependencies"
npm ci

echo "==> Building application"
npm run build

echo "==> Restarting staging"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME"
else
  pm2 start node_modules/next/dist/bin/next \
    --name "$APP_NAME" \
    -- start -H 127.0.0.1 -p "$PORT"
fi

pm2 save

echo "==> Checking staging health"
for attempt in {1..10}; do
  if curl --fail --silent "http://127.0.0.1:${PORT}/" >/dev/null; then
    echo "Deployment successful: HTTP 200"
    exit 0
  fi
  sleep 2
done

echo "ERROR: Staging health check failed"
exit 1
