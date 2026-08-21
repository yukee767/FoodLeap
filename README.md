# FoodLeap — Gastronomia e FoodTech

> Receitas diárias personalizadas + dieta integrada (15 perguntas) + acompanhamento nutricional humano.

Filosofia: comer bem e prático, sem dietas restritas. *"É melhor comer um pouco de tudo, do que comer um monte de pouco."*

**Repo:** https://github.com/yukee767/FoodLeap — Público | **Decisões:** 4 agentes em paralelo (Frontend, Backend, Produto, Infra)

## Arquitetura Final (sem Vue)

| Camada | Stack | Porta | Descrição |
|---|---|---|---|
| **Frontend** | Next.js 15 + React 19 + Tailwind + shadcn/ui + Zustand 5 + TanStack Query 5 + RHF+Zod | `3000` | App Router, Route Groups `(marketing)`/`(app)`, SEO ISR + JSON-LD, wizard 15 perguntas |
| **API Principal** | Node.js + Express + TypeORM + Zod | `3001` | `users, recipes, diet_profiles, subscriptions` — source of truth escrita |
| **Busca/Q&A** | NestJS 11 + TypeORM | `3002` | `GET /api/search?q=&occasion=` full-text `tsvector` pt-BR + GIN, Comments/Questions |
| **Admin** | FastAPI + SQLAlchemy + Alembic | `8000` | Dashboard exclusivo, JWT separado, `cache_adm` isolado |
| **DB Principal** | PostgreSQL 16 | `5432` | UUIDv7, `pg_trgm/unaccent`, tsvector |
| **Cache/Fila** | Redis 7 | `6379` | `cache_used:*` (daily 24h, diet:plan 1h) e `cache_adm:*` (stats 10min), rate-limit, blocklist JWT, pub/sub invalidação |

> **Decisões consolidadas:** Nuxt removido (Vue incompatível com React). Apache Ignite removido — Redis cobre 100% do MVP (Ignite = JVM 1-2GB, cliente Node abandonado 2019, overkill; voltar só se >25k DAU com compute distribuído). Hapi.js não criado (NestJS já cobre Node; só entra se precisar de plugin Hapi específico). Ver `infra/docker-compose.yml:1` e `infra/docker-compose.prod.yml:1`.

## Estrutura

```
apps/
  web/              # Next.js — src/app/(marketing), (app)/receitas/[slug], dieta/onboarding, ocasioes/[occasion]
  api-main/         # Express — src/modules/auth, recipes, diet (15 perguntas completas)
  search-service/   # NestJS — search, questions, comments
  admin-api/        # FastAPI — main.py
packages/
  shared-types/     # Zod schemas compartilhados (DietAnswers, Recipe)
infra/
  docker-compose.yml       # dev: Postgres+Redis
  docker-compose.prod.yml  # prod: 4 apps + healthchecks + GHCR
.github/workflows/  # ci.yml, cd.yml (GHCR)
```

## Domínio

1. **Quiz 15 perguntas** `GET /api/diet/questions` — 3 blocos: A Objetivo/Corpo (Q1-5), B Rotina/Praticidade (Q6-10), C Paladar (Q11-15). Wizard 1 pergunta/tela, Zustand persist + `nuqs` step, RHF+Zod.
2. **Dieta programada** `POST /api/diet/profile` → algoritmo usuário+sistema (filtros hard Q3/Q13/Q8 + scoring proteína 30 + tempo 25 + objetivo 20 + sabor/custo) → `meal_plans` → cache `cache_used:diet:plan:{userId}` TTL 1h + invalidação via Redis pub/sub.
3. **Receita do dia** `GET /api/recipes/daily` → `cache_used:daily:{userId}:{yyyy-mm-dd}` TTL até 00:00 BRT.
4. **Ocasiões** 12 coleções curadas (Jantar Romântico, Marmita, Kids, etc) — `occasions` N:N, filtro `?occasion=romantico`.
5. **Acompanhamento** Planos: Free (R$0), Essencial R$19,90/mês, Nutri Prime R$149,90/mês (1 consulta/mês + chat 24h).

## Quickstart

```bash
# infra
docker compose -f infra/docker-compose.yml up -d

# deps
npm install
pip install -r apps/admin-api/requirements.txt

# env
cp .env.example .env
# edite POSTGRES_PASSWORD, JWT_SECRET (openssl rand -hex 32)

# dev (4 terminais)
npm run dev --workspace=@foodleap/api-main      # :3001
npm run dev --workspace=@foodleap/search-service # :3002
uvicorn main:app --reload --app-dir apps/admin-api # :8000
npm run dev --workspace=@foodleap/web           # :3000
```

Cheque: `GET http://localhost:3001/api/health`, `http://localhost:3002/api/search?q=moqueca`, `http://localhost:8000/health`, `http://localhost:3000`.

Prod: `docker compose -f infra/docker-compose.prod.yml up -d` (imagens GHCR) ou `TAG=sha docker compose -f infra/docker-compose.prod.yml pull && up -d`.

## API

- `GET /api/diet/questions` — 15 perguntas
- `POST /api/diet/profile` — `{userId, answers}` → 201 + invalida `cache_used:diet:plan:{userId}`
- `GET /api/diet/plan/:userId` — TTL 1h Redis
- `GET /api/recipes/daily` — header `x-user-id`, TTL até 00:00 BRT
- `GET /api/recipes?occasion=romantico&time=15min&cursor=&limit=20` — GIN tsvector + cursor pagination
- `GET /api/recipes/:id` — `cache_used:recipe:{id}` TTL 1h
- `GET /api/recipes/slug/:slug` — para ISR `generateStaticParams`
- `GET /api/search?q=&occasion=` + `/api/search/suggest?q=` (NestJS) — trigram GIN, `cache_used:search:q:{hash}`
- `GET /api/comments?recipe_id=` + `POST /api/comments` — `cache_used:comments:{recipeId}` TTL 5min
- `GET /api/questions?recipe_id=` + `POST /api/questions`
- `POST /api/auth/register` / `login` (JWT 15m + refresh 7d) / `refresh` / `logout` (blocklist) / `GET /api/auth/me` (Bearer)
- `GET /admin/stats` + `/admin/recipes` (FastAPI, `cache_adm:*` TTL 10min, guard `ADMIN_JWT_SECRET`)

## Roadmap

- **MVP 0-4m:** 150 receitas tagueadas, scoring regras, 12 ocasiões estáticas, paywall Stripe, RC/U/S >1.5, D7>25%
- **Pós-MVP:** reaproveitamento inteligente, lista 1-clique (afiliado mercado), chat Nutri + copiloto IA, SEO programático 500 LPs

## Commits (cada feature = 1 commit + push)

- `f06a6ed` scaffold monorepo sem Vue (4 agentes paralelos)
- `2baa9d2` `feat(web): foundation Tailwind + shadcn + app shell`
- `6749350` `feat(web): wizard dieta 15 perguntas (3 blocos) + plano`
- `a118a34` `feat(web): receitas + ocasioes + daily + SEO`
- `3fbabc2` `feat(api): DB modelagem TypeORM + migrations + seeds`
- `4b6ee2b` `feat(search): full-text + comments + questions (NestJS)`
- `8dfd932` `feat(auth): JWT 15m + refresh 7d + Redis blocklist + admin guard`

> Workflows `.github/workflows/ci.yml` + `cd.yml` (GHCR) estão locais em `.github/` — requer `gh auth refresh -s workflow` para push (OAuth scope `workflow`).

Ver decisões completas dos 4 agentes (Frontend, Backend, Produto, Infra) em histórico do chat.

## Licença

MIT — FoodLeap
