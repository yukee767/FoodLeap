# Infra Cloudflare – FoodLeap (Organizado)

Deploy **100% Cloudflare** sem Docker, com separação clara por app.

```
infra/cloudflare/
  README.md          ← este arquivo
  deploy.sh          ← script único que sobe tudo em ordem
  deploy.ps1         ← mesmo script para Windows PowerShell
  env.example        ← vars públicas
  secrets.example    ← lista de secrets (não commitar)
  seed-r2.sh         ← sobe banco de receitas scraped para R2
  routes.example     ← exemplo de rotas domínio custom

apps/
  api-main/wrangler.toml      → Worker foodleap-api (Hono)
  search-service/wrangler.toml→ Worker foodleap-search (Hono)
  web/wrangler.toml           → Worker foodleap-web (OpenNext)
  web/open-next.config.ts     → config Cloudflare
```

## Arquitetura no Cloudflare

| Camada | Recurso Cloudflare | Código | Domínio |
|---|---|---|---|
| **Web** | Workers + Assets (OpenNext) | `apps/web` | `foodleap.com.br` + `www` |
| **API Main** | Worker + Hyperdrive + KV + R2 | `apps/api-main/src/worker.ts` | `api.foodleap.com.br` |
| **Search** | Worker + Hyperdrive + KV | `apps/search-service/src/worker.ts` | `search.foodleap.com.br` |
| **DB** | Hyperdrive → Postgres (Neon/Supabase) | externo | - |
| **Cache** | KV `CACHE_KV` (substitui Redis) | `cache_used:*` | - |
| **Banco Receitas** | KV `foodleap-recipes` / R2 | `data/banco_de_dados_final_50.json` | - |
| **Admin** | *Não* em Workers (FastAPI Python) → Cloudflare Containers ou VM | `apps/admin-api` | `admin.foodleap.com.br` |

## Pré-requisitos

```bash
npm install -g wrangler@latest
wrangler login
```

Crie recursos **uma vez**:

```bash
wrangler hyperdrive create foodleap-db --connection-string="postgresql://user:pass@host:5432/foodleap"
wrangler kv namespace create CACHE_KV
wrangler kv namespace create CACHE_KV --preview
wrangler r2 bucket create foodleap-recipes # opcional, KV já usado
```

Copie IDs para cada `wrangler.toml` e descomente.

## Variáveis e Secrets

**Vars públicas** – em `infra/cloudflare/env.example` e em cada `wrangler.toml [vars]`.

**Secrets** – use:
```bash
wrangler secret put JWT_SECRET --config apps/api-main/wrangler.toml
wrangler secret put ADMIN_JWT_SECRET --config apps/api-main/wrangler.toml
```

Lista completa em `infra/cloudflare/secrets.example`.

## Deploy

```bash
bash infra/cloudflare/deploy.sh
powershell -ExecutionPolicy Bypass -File infra/cloudflare/deploy.ps1
npm run deploy:cf        # all
npm run deploy:cf:api    # só api
npm run deploy:cf:search # só search
npm run deploy:cf:web    # só web (requer Linux/WSL)
```

`deploy.sh` faz: 1) foodleap-api 2) foodleap-search 3) foodleap-web (OpenNext build + Workers) 4) Upload banco para KV/R2.

Manual:
```bash
wrangler deploy --config apps/api-main/wrangler.toml
wrangler deploy --config apps/search-service/wrangler.toml
npm run build:worker --workspace=@foodleap/web
wrangler deploy --config apps/web/wrangler.toml
```

## Domínio custom

Descomente `routes` em cada `wrangler.toml` quando DNS no Cloudflare.

## Banco scraped em KV

`data/banco_de_dados_final_50.json` (49 receitas balanceadas) já em KV `recipes:all` (34fadba6525b47eaa26b55775792f187). Worker lê via `CACHE_KV.get('recipes:all','json')` com fallback `MOCK_RECIPES`.

Seed:
```bash
bash infra/cloudflare/seed-r2.sh
# ou via KV API: node infra/cloudflare/kv-put.mjs
```

## Observabilidade

`[observability.logs] enabled=true` → Dashboard → Workers → Logs.

## Rollback

```bash
wrangler deployments list --config apps/api-main/wrangler.toml
wrangler rollback --config apps/api-main/wrangler.toml <id>
```
