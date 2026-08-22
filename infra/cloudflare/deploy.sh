#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
API_CFG="$ROOT_DIR/apps/api-main/wrangler.toml"
SEARCH_CFG="$ROOT_DIR/apps/search-service/wrangler.toml"
WEB_CFG="$ROOT_DIR/apps/web/wrangler.toml"
ONLY="${1:-all}"
SKIP_BUILD=false
if [[ "$*" == *"--skip-build"* ]]; then SKIP_BUILD=true; fi
if [[ "$ONLY" == --only=* ]]; then ONLY="${ONLY#--only=}"; fi
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC} $*"; }
check_wrangler() { if ! command -v wrangler &> /dev/null; then echo "wrangler não encontrado"; exit 1; fi; wrangler --version; }
deploy_api() { info "Deploy foodleap-api..."; wrangler deploy --config "$API_CFG"; info "API → https://foodleap-api.victorlima124tt.workers.dev"; }
deploy_search() { info "Deploy foodleap-search..."; wrangler deploy --config "$SEARCH_CFG"; info "Search → https://foodleap-search.victorlima124tt.workers.dev"; }
deploy_web() { info "Deploy foodleap-web..."; if [[ "$SKIP_BUILD" != true ]]; then npm run build:worker --workspace=@foodleap/web; fi; wrangler deploy --config "$WEB_CFG"; info "Web → https://foodleap-web.victorlima124tt.workers.dev"; }
seed_kv() { if [[ -f "$ROOT_DIR/data/banco_de_dados_final_50.json" ]]; then info "KV já com recipes:all (34fadba...), skip seed"; else warn "data/banco_de_dados_final_50.json não encontrado"; fi; }
check_wrangler
info "Root: $ROOT_DIR | Only: $ONLY | SkipBuild: $SKIP_BUILD"
case "$ONLY" in api) deploy_api ;; search) deploy_search ;; web) deploy_web ;; all) deploy_api; echo ""; deploy_search; echo ""; deploy_web; echo ""; seed_kv ;; *) echo "Uso: bash infra/cloudflare/deploy.sh [--only=api|search|web]"; exit 1 ;; esac
info "Deploy concluído! https://dash.cloudflare.com"
