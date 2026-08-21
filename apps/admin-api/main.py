from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FoodLeap Admin API", version="0.1.0", description="Dashboard admin exclusivo - FastAPI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "admin-api", "cache": "adm"}

@app.get("/admin/stats")
def stats():
    # TODO: PostgreSQL aggregates + Ignite cache_adm
    return {"users": 0, "recipes": 0, "subscriptions": 0}

@app.get("/admin/recipes")
def list_recipes_admin():
    # CRUD admin de receitas
    return {"data": []}

# TODO: integrar com PostgreSQL (SQLAlchemy async), Redis, Ignite (cache_adm separado de cache_used)
