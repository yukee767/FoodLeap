from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    admin_jwt_secret: str = os.getenv("ADMIN_JWT_SECRET", "change-me-admin-secret-min-32-chars")
    database_url: str = os.getenv("DATABASE_URL", "postgresql://foodleap:foodleap_dev@localhost:5432/foodleap")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/1")

settings = Settings()

app = FastAPI(title="FoodLeap Admin API", version="0.2.0", description="Dashboard admin exclusivo - FastAPI (cache_adm isolado)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple admin guard (placeholder - validate ADMIN_JWT)
async def require_admin(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing admin token")
    # TODO: jwt.decode(authorization[7:], settings.admin_jwt_secret) + check role admin + Redis blocklist
    return {"sub": "admin-placeholder"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "admin-api", "cache": "cache_adm", "version": "0.2.0"}

@app.get("/admin/stats")
def stats(_admin=Depends(require_admin)):
    # TODO: SELECT count(*) FROM users / recipes + Redis cache_adm:stats TTL 10min
    # cache = redis.get("cache_adm:stats") or query
    return {"users": 0, "recipes": 0, "subscriptions": 0, "cache": "cache_adm:stats TTL 10min"}

@app.get("/admin/recipes")
def list_recipes_admin(page: int = 1, limit: int = 20, _admin=Depends(require_admin)):
    # TODO: SELECT * FROM recipes ORDER BY created_at DESC LIMIT :limit OFFSET :offset + cache_adm:recipes:list:{page} TTL 5min
    return {"data": [], "page": page, "limit": limit}

@app.post("/admin/recipes")
def create_recipe_admin(payload: dict, _admin=Depends(require_admin)):
    # TODO: insert + invalidate cache_adm:recipes:* + publish invalidate to cache_used:recipe:*
    return {"id": "uuid", **payload}

@app.delete("/admin/recipes/{recipe_id}")
def delete_recipe_admin(recipe_id: str, _admin=Depends(require_admin)):
    # TODO: soft delete + invalidate
    return {"deleted": recipe_id}

@app.get("/admin/diet-profiles")
def list_diet_profiles(_admin=Depends(require_admin)):
    return {"data": []}
