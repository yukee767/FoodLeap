#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BUCKET="foodleap-recipes"
echo "[seed-r2] Bucket: $BUCKET"
if ! wrangler r2 bucket list 2>/dev/null | grep -q "$BUCKET"; then
  echo "[seed-r2] enable R2 first: https://dash.cloudflare.com"
  exit 0
fi
for file in "$ROOT_DIR"/data/*.json; do
  [ -e "$file" ] || continue
  name=$(basename "$file")
  echo "[seed-r2] Upload $name..."
  wrangler r2 object put "$BUCKET/$name" --file="$file" --remote || true
done
if [[ -f "$ROOT_DIR/data/banco_de_dados_final_50.json" ]]; then
  wrangler r2 object put "$BUCKET/banco.json" --file="$ROOT_DIR/data/banco_de_dados_final_50.json" --remote || true
fi
echo "[seed-r2] OK"
