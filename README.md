# FoodLeap — Gastronomia e FoodTech

[![Repo](https://img.shields.io/badge/GitHub-yukee767%2FFoodLeap-0d3b66?style=for-the-badge&logo=github)](https://github.com/yukee767/FoodLeap) [![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Express%20%7C%20NestJS%20%7C%20FastAPI-blue)](#stack) [![Infra Local](https://img.shields.io/badge/Infra-Docker%20Compose-2496ED?logo=docker)](#como-rodar--docker-compose) [![Deploy](https://img.shields.io/badge/Deploy-GHCR%20%2B%20Cloudflare-F38020)](#como-rodar--produção)

> Receitas diárias personalizadas + dieta integrada (15 perguntas) + acompanhamento nutricional humano.
> Filosofia: comer bem e prático, sem dietas restritas. *"É melhor comer um pouco de tudo, do que comer um monte de pouco."*

**Repositório público** — https://github.com/yukee767/FoodLeap

---

## Índice

- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Diagrama Textual](#diagrama-textual)
- [Pré-requisitos](#pré-requisitos)
- [Como Rodar — Docker Compose](#como-rodar--docker-compose)
- [Como Rodar — Produção](#como-rodar--produção)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Desenvolvimento](#desenvolvimento)
- [Roadmap](#roadmap)

---

## Stack

| Camada | Tecnologia | Porta |
|---|---|---|
| **Frontend** | Next.js 15 + React 19 + Tailwind + shadcn/ui + Zustand 5 + TanStack Query 5 + RHF+Zod | `3000` |
| **API Principal** | Node.js + Express + TypeORM + Zod | `3001` |
| **Busca/Q&A** | NestJS 11 + TypeORM | `3002` |
| **Admin** | FastAPI + SQLAlchemy + Alembic | `8000` |
| **Banco Relacional** | PostgreSQL 16 (UUIDv7, `pg_trgm`/`unaccent`, tsvector) | `5432` |
| **Cache/Fila** | Redis 7 (`cache_used:*`, `cache_adm:*`, rate-limit, blocklist JWT, pub/sub) | `6379` |
| **Auth** | JWT (access 15m + refresh 7d) | — |
| **Infra Local** | Docker Compose | — |
| **Infra Produção** | Docker Compose + imagens GHCR + Cloudflare Workers | — |

---

## Arquitetura

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                      │
│  Next.js (:3000) ──────►  Usuários finais                            │
│  App Router, Route Groups, wizard dieta (15 perguntas), SEO ISR      │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
              ┌─────────────┼──────────────────┐
              ▼             ▼                  ▼
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  Express (:3001)     │ │  NestJS (:3002)  │ │  FastAPI (:8000)     │
│  - Auth / Users      │ │  - Search        │ │  - Dashboard admin   │
│  - Recipes           │ │  - Comments      │ │  - Stats             │
│  - Diet / Meal Plans │ │  - Questions     │ │  - JWT separado      │
└──────┬───────┬───────┘ └────────┬─────────┘ └──────────┬───────────┘
       │       │                  │                      │
       └───────┴────────┬─────────┴──────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     INFRA COMPARTILHADA                             │
│  Postgres 16  ── dados relacionais (source of truth escrita)        │
│  Redis DB0    ── cache_used:* (daily 24h, diet:plan 1h, search)     │
│                 rate-limit + blocklist JWT + pub/sub invalidação    │
│  Redis DB1    ── cache_adm:* (stats admin TTL 10min)                │
└─────────────────────────────────────────────────────────────────────┘
```

### Separação de responsabilidades

- **Express (api-main)** — source of truth de escrita: auth, receitas, diet profiles (quiz 15 perguntas), meal plans e scoring.
- **NestJS (search-service)** — leitura otimizada: busca full-text `tsvector` pt-BR com índices GIN/trigram, comentários e perguntas & respostas por receita.
- **FastAPI (admin-api)** — dashboard administrativo exclusivo, JWT separado (`ADMIN_JWT_SECRET`) e cache isolado em `cache_adm:*`.
- **Redis** — cache com separação física: `cache_used:*` (app) vs `cache_adm:*` (admin); invalidação via pub/sub; rate-limit e blocklist de refresh tokens.

---

## Diagrama Textual

```
[Cliente Browser] ──► [Next.js :3000] ──► [Express :3001] ──► [Postgres]
                                              │    │
                                              │    ├──► [Redis DB0] (cache_used:*)
                                              │    ├──► [Redis pub/sub] (invalidação diet:plan)
                                              │    └──► [JWT blocklist]
                                              │
[Cliente Browser] ──► [Next.js] ──► [NestJS :3002] ──► [Postgres: tsvector + GIN]
                                              │
                                              └──► [Redis DB0: cache_used:search:*]

[Admin Browser] ──► [FastAPI :8000] ──► [Postgres] + [Redis DB1: cache_adm:*]

Infra Docker Compose: todos os serviços na network foodleap, volumes persistentes,
healthchecks (pg_isready / redis-cli ping / wget health).
Prod: imagens GHCR via docker-compose.prod.yml + deploy web em Cloudflare Workers (OpenNext).
```

---

## Pré-requisitos

- Docker 24+ e Docker Compose v2
- Node.js 20+ e npm 10+
- Python 3.11+ (para o FastAPI do admin)
- `openssl` para gerar os secrets JWT

---

## Como Rodar — Docker Compose

```bash
# 1. Clone o repositório
git clone https://github.com/yukee767/FoodLeap
cd FoodLeap

# 2. Suba a infraestrutura (Postgres + Redis)
docker compose -f infra/docker-compose.yml up -d

# 3. Instale as dependências
npm install
pip install -r apps/admin-api/requirements.txt

# 4. Configure variáveis
cp .env.example .env
# Edite POSTGRES_PASSWORD, JWT_SECRET (openssl rand -hex 32) e ADMIN_JWT_SECRET

# 5. Rode as migrations + seeds (api-main cria schema e popula dados)
#    (executam automaticamente no start da api-main)

# 6. Suba os apps (4 terminais)
npm run dev --workspace=@foodleap/api-main       # :3001
npm run dev --workspace=@foodleap/search-service # :3002
uvicorn main:app --reload --app-dir apps/admin-api # :8000
npm run dev --workspace=@foodleap/web            # :3000

# 7. Verifique saúde dos serviços
curl http://localhost:3001/api/health         # Express
curl "http://localhost:3002/api/search?q=moqueca" # NestJS
curl http://localhost:8000/health             # FastAPI
curl http://localhost:3000                    # Next.js

# 8. Parar
docker compose -f infra/docker-compose.yml down
# Para remover volumes: docker compose -f infra/docker-compose.yml down -v
```

### Serviços e portas (padrão)

| Serviço | Porta Host |
|---|---|
| Postgres 16 | 5432 |
| Redis 7 | 6379 |
| Next.js (web) | 3000 |
| Express (api-main) | 3001 |
| NestJS (search-service) | 3002 |
| FastAPI (admin-api) | 8000 |

---

## Como Rodar — Produção

As imagens são publicadas no GHCR pelo workflow `cd.yml` e orquestradas pelo `infra/docker-compose.prod.yml`.

```bash
# 1. Configure variáveis obrigatórias
cp .env.example .env
# POSTGRES_PASSWORD, JWT_SECRET, ADMIN_JWT_SECRET são obrigatórios (?required)

# 2. Suba toda a stack (imagens ghcr.io/yukee767/foodleap/*)
docker compose -f infra/docker-compose.prod.yml up -d

# Ou fixe uma versão específica (TAG = sha do commit)
TAG=<sha> docker compose -f infra/docker-compose.prod.yml pull
TAG=<sha> docker compose -f infra/docker-compose.prod.yml up -d

# 3. Acompanhe logs e verifique
docker compose -f infra/docker-compose.prod.yml logs -f
docker compose -f infra/docker-compose.prod.yml ps
curl http://localhost:3000   # único serviço exposto ao host (:3000)
```

> O frontend também pode ser deployado standalone em **Cloudflare Workers** via OpenNext (`apps/web/wrangler.toml`, scripts `build:worker`/`preview`/`deploy`).

CI/CD: `.github/workflows/ci.yml` (lint/build/test) e `cd.yml` (build + push GHCR).

---

## Variáveis de Ambiente

Copie `.env.example` para `.env`. Principais variáveis:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL Postgres (api-main + search-service + admin-api) |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credenciais do Postgres (usadas pelos containers) |
| `REDIS_URL` | Redis DB0 — cache app (`cache_used:*`), rate-limit, blocklist JWT |
| `REDIS_ADM_URL` | Redis DB1 — cache admin (`cache_adm:*`) |
| `JWT_SECRET` | Segredo JWT (gere com `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | Expiração do access token (padrão `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Expiração do refresh token (padrão `7d`) |
| `ADMIN_JWT_SECRET` | Segredo JWT separado do dashboard admin |
| `WEB_URL` / `API_MAIN_URL` / `SEARCH_SERVICE_URL` / `ADMIN_API_URL` | URLs dos serviços entre si |
| `SENTRY_DSN` | Observabilidade (opcional) |

Veja `.env.example` para lista completa.

---

## Banco de Dados

O schema é criado automaticamente pela migration inicial da api-main (`1700000000000-Init.ts`) via TypeORM — extensões `uuid-ossp`, `citext`, `pg_trgm`, `unaccent`; índices GIN full-text/trigram; trigger `trg_recipes_search_vector` (tsvector em português com unaccent).

### Tabelas principais

`users` (email citext, role `user|nutritionist|admin`, soft delete), `recipes` (slug, difficulty, kcal_range, `search_vector` tsvector pt-BR), `ingredients`, `recipe_ingredients` (N:N com quantidade/unidade), `occasions` (12 coleções curadas), `recipe_occasions` (N:N), `diet_profiles` (respostas jsonb das 15 perguntas), `meal_plans` (gerado por usuário ou sistema, semana, kcal totais), `meal_plan_items` (dia 1–7, tipo `cafe|almoco|jantar|lanche`, porção).

### Seeds inclusos

- **Ocasiões:** 12 coleções — romantico, marmita, kids, rapido, fitness, familia, amigos, fim_de_semana, economico, lowcarb, vegano, cafe
- **Receitas de exemplo:** Frango Cremoso Low Carb, Salmão Grelhado Romântico, Omelete Rápido 5min (com `ON CONFLICT DO NOTHING`)

Recriar banco do zero:

```bash
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d postgres
docker compose -f infra/docker-compose.yml logs postgres
```

---

## Estrutura de Pastas

```
.
├── .env.example
├── .github/
│   └── workflows/           # ci.yml, cd.yml (GHCR)
├── apps/
│   ├── web/                 # Next.js 15 + React 19
│   │   └── src/
│   │       ├── app/             # rotas raiz + (app)/dieta/, receitas/, ocasioes/
│   │       ├── components/      # ui/ (shadcn), diet/ (wizard), layout/, providers/
│   │       ├── hooks/           # useDietWizard, useDietPlan, use-recipes, use-search
│   │       ├── lib/             # api-client, diet-questions, seo, validators/diet
│   │       └── stores/          # diet-wizard.store.ts (Zustand persist)
│   ├── api-main/            # Express + TypeORM
│   │   └── src/
│   │       ├── config/          # data-source.ts
│   │       ├── entities/        # 9 tabelas
│   │       ├── middleware/      # auth.ts
│   │       ├── migrations/      # Init (extensões, GIN, triggers)
│   │       ├── modules/         # auth/, diet/ (+ scoring), recipes/
│   │       ├── seeds/           # seed.ts
│   │       └── utils/           # jwt.ts, redis.ts
│   ├── search-service/      # NestJS 11
│   │   └── src/                 # search/, comments/, questions/
│   └── admin-api/           # FastAPI
│       └── app/                 # main.py, requirements.txt
├── packages/
│   └── shared-types/        # schemas Zod compartilhados (DietAnswers, Recipe)
└── infra/
    ├── docker-compose.yml       # dev: Postgres + Redis
    └── docker-compose.prod.yml  # prod: 4 apps + Postgres + Redis + healthchecks
```

---

## Desenvolvimento

```bash
# Frontend Next.js
npm run dev --workspace=@foodleap/web

# API principal Express
npm run dev --workspace=@foodleap/api-main

# Busca/Q&A NestJS
npm run dev --workspace=@foodleap/search-service

# Admin FastAPI
pip install -r apps/admin-api/requirements.txt
uvicorn main:app --reload --app-dir apps/admin-api

# Tudo de uma vez (infra + workspaces)
npm run dev:all
```

---

## Roadmap

- **MVP 0-4m:** 150 receitas tagueadas, scoring regras, 12 ocasiões estáticas, paywall Stripe, RC/U/S >1.5, D7>25%
- **Pós-MVP:** reaproveitamento inteligente, lista 1-clique (afiliado mercado), chat Nutri + copiloto IA, SEO programático 500 LPs

---

## Licença

MIT — FoodLeap

Dúvidas sobre como o projeto foi feito? Me mande um email victorlima124tt@gmail.com ou entre em contato pelo discord yukee676.
