#!/usr/bin/env bash
#
# deploy.sh — pull latest code, rebuild, and restart the stack on the EC2 host.
# Usage:  ./deploy.sh
#
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Checking prerequisites"
command -v docker >/dev/null || { echo "docker not installed"; exit 1; }
docker compose version >/dev/null || { echo "docker compose plugin not installed"; exit 1; }

if [ ! -f .env ]; then
  echo "ERROR: .env file is missing. Create it before deploying (see .env.example)."
  exit 1
fi

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Building and starting containers"
docker compose up -d --build --remove-orphans

echo "==> Waiting for services to settle"
sleep 5
docker compose ps

echo "==> Pruning unused images"
docker image prune -f >/dev/null

echo "==> Recent API logs"
docker compose logs --tail=20 api || true

echo "==> Done. Health check:"
curl -fsS -I https://scholarhub.palshop.app/api/health || \
  echo "(health check failed — check 'docker compose logs -f caddy api')"
