#!/usr/bin/env python3
"""
AIDEP Proje Şablonu — Teknosel 2026 OÜ2662
Kullanım: python create_aidep_template.py          → AIDEP/ oluşturur
          python create_aidep_template.py BenimProje → özel isim
"""
import os, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "AIDEP"

# (yol, içerik) — içerik "" ise boş dosya
FILES = [

  # ── KÖK ──────────────────────────────────────────────────────
  (".gitignore", """\
.env
.env.local
secrets/
ml_models/*.pt
ml_models/*.pkl
ml_models/*.onnx
__pycache__/
*.pyc
.venv/
node_modules/
.expo/
*.tsbuildinfo
dist/
.coverage
htmlcov/
.DS_Store
datasets/raw/
datasets/labeled/
runs/
"""),
  (".gitattributes", "* text=auto\n"),
  (".pre-commit-config.yaml", "repos: []\n"),
  ("README.md", """\
# AIDEP — AI Disaster Emergency Platform
Teknosel 2026 | OÜ2662 | Yerel Yönetimlerde Akıllı Şehircilik

## AI Pipeline (Rapor §3.3)
1. YOLOv8m   → Hasar tespiti, 7 sınıf         [ai-service/]
2. XGBoost   → Talep önceliklendirme, 0-100    [ai-service/]
3. Greedy    → Gönüllü-talep eşleştirme        [backend/app/logic/]
4. OSRM      → Güvenli rota hesaplama          [backend/app/services/]

## Başlangıç
```bash
cp docker/.env.dev.example docker/.env.dev
make dev
```
"""),
  ("development.md", "# Geliştirme Rehberi\nTODO\n"),
  ("deployment.md",  "# Deployment Rehberi\nTODO\n"),
  ("BACKEND_BUGS.md","# Bilinen Sorunlar\n| Sorun | Tarih | Durum |\n|-------|-------|-------|\n"),
  ("SECURITY.md",    "# Güvenlik\nKVKK uyumu: Issue BE2-009\n"),
  ("release-notes.md","# Release Notes\n## v1.0.0\n- İlk MVP\n"),
  ("copier.yml",     "_subdirectory: .\n"),
  ("docker-build.ps1","docker compose -f docker/docker-compose.dev.yml build\n"),
  ("Makefile", """\
.PHONY: help dev prod down logs migrate test seed clean
help:
\t@echo "make dev | prod | down | logs | migrate | test | seed | clean"
dev:
\t@[ -f docker/.env.dev ] || cp docker/.env.dev.example docker/.env.dev
\tdocker compose -f docker/docker-compose.dev.yml up --build
prod:
\tdocker compose -f docker/docker-compose.prod.yml up --build -d
down:
\tdocker compose -f docker/docker-compose.dev.yml down
logs:
\tdocker compose -f docker/docker-compose.dev.yml logs -f --tail=100
migrate:
\tdocker compose -f docker/docker-compose.dev.yml run --rm backend alembic upgrade head
test:
\tdocker compose -f docker/docker-compose.dev.yml exec backend pytest tests/ -v
seed:
\tdocker compose -f docker/docker-compose.dev.yml exec backend python app/data/seed_demo.py
clean:
\t@read -p "Tüm veriler silinecek! ENTER..." _
\tdocker compose -f docker/docker-compose.dev.yml down -v --remove-orphans
"""),

  # ── .GITHUB ──────────────────────────────────────────────────
  (".github/labeler.yml", "backend:\n  - backend/**\nai:\n  - ai-service/**\nfrontend:\n  - frontend/**\nmobile:\n  - mobile/**\n"),
  (".github/workflows/ci.yml", """\
name: CI
on:
  push:    {branches: [main, develop]}
  pull_request: {branches: [main]}
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - run: cd backend && uv sync
      - run: cd backend && uv run ruff check .
      - run: cd backend && uv run pytest tests/ -v
  ai-service:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - run: cd ai-service && uv sync
      - run: cd ai-service && uv run pytest tests/ -v
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - run: cd frontend && npm ci && npx biome check src/ && npm run build
"""),
  (".github/workflows/deploy.yml", "name: Deploy\non:\n  workflow_dispatch:\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo 'TODO deploy'\n"),
  (".github/DISCUSSION_TEMPLATE/general.md", "---\ntitle: Genel\n---\n"),

  # ── .COPIER ──────────────────────────────────────────────────
  (".copier/.copier-answers.yml.jinja", ""),
  (".copier/update_dotenv.py", ""),

  # ── SCRIPTS / RND / HOOKS ────────────────────────────────────
  ("scripts/README.md", "# Scriptler\n"),
  ("rnd/README.md",     "# Araştırma & Geliştirme\n"),
  ("hooks/post_gen_project.py", "print('AIDEP projesi hazır.')\n"),

  # ── DOCKER ───────────────────────────────────────────────────
  ("docker/.env.dev.example", """\
ENVIRONMENT=development
POSTGRES_USER=aidep
POSTGRES_PASSWORD=GUCLU_SIFRE
POSTGRES_DB=aidep_db
SECRET_KEY=MIN_32_KARAKTER_RASTGELE
MINIO_ACCESS_KEY=aidep_minio
MINIO_SECRET_KEY=MINIO_SIFRESI
AFAD_API_KEY=
FIREBASE_CONFIG={}
YOLO_MODEL_PATH=/models/yolov8m_aidep.pt
XGBOOST_MODEL_PATH=/models/xgboost_priority.pkl
VITE_API_URL=http://localhost/api
VITE_WS_URL=ws://localhost/ws
"""),
  ("docker/.env.prod.example", """\
ENVIRONMENT=production
POSTGRES_USER=aidep
POSTGRES_PASSWORD=
POSTGRES_DB=aidep_db
SECRET_KEY=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
AFAD_API_KEY=
FIREBASE_CONFIG={}
YOLO_MODEL_PATH=/models/yolov8m_aidep.pt
XGBOOST_MODEL_PATH=/models/xgboost_priority.pkl
"""),
  ("docker/docker-compose.dev.yml", """\
version: "3.9"
# AIDEP Geliştirme Ortamı — make dev

services:
  nginx:
    image: nginx:1.25-alpine
    container_name: aidep-nginx
    ports: ["80:80"]
    volumes: [../nginx/nginx.conf:/etc/nginx/nginx.conf:ro]
    depends_on: [backend, frontend]
    networks: [aidep-net]
    restart: unless-stopped

  backend:
    build: {context: ../backend, dockerfile: Dockerfile}
    container_name: aidep-backend
    env_file: .env.dev
    volumes:
      - ../backend:/app
      - ../ml_models:/app/ml_models:ro
    depends_on:
      postgres: {condition: service_healthy}
      redis:    {condition: service_healthy}
    networks: [aidep-net]
    ports: ["8000:8000"]
    command: uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # ─── AI SERVİSİ ───────────────────────────────────────────────
  # Rapor §3.3: YOLOv8m + XGBoost ayrı servis
  # GPU için: deploy.resources.reservations.devices[nvidia] ekle
  ai:
    build: {context: ../ai-service, dockerfile: Dockerfile}
    container_name: aidep-ai
    env_file: .env.dev
    volumes:
      - ../ml_models:/models:ro   # yolov8m_aidep.pt + xgboost_priority.pkl
      - ../ai-service:/app
    depends_on: [minio]
    networks: [aidep-net]
    ports: ["8001:8001"]

  frontend:
    build: {context: ../frontend, dockerfile: Dockerfile}
    container_name: aidep-frontend
    env_file: .env.dev
    volumes: [../frontend/src:/app/src]
    networks: [aidep-net]
    ports: ["3000:3000"]

  postgres:
    image: postgis/postgis:16-3.4-alpine
    container_name: aidep-postgres
    environment:
      POSTGRES_USER: "${POSTGRES_USER:-aidep}"
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
      POSTGRES_DB: "${POSTGRES_DB:-aidep_db}"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ../postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-aidep}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks: [aidep-net]
    ports: ["5432:5432"]

  redis:
    image: redis:7.2-alpine
    container_name: aidep-redis
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks: [aidep-net]

  # OSRM — Türkiye haritası, ilk başlatmada ~15 dk (Issue DOC-007)
  osrm:
    image: osrm/osrm-backend:v5.27.1
    container_name: aidep-osrm
    volumes: [osrmdata:/data]
    command: >
      sh -c "
        if [ ! -f /data/turkey-latest.osrm ]; then
          wget -q -O /data/turkey-latest.osm.pbf
            https://download.geofabrik.de/europe/turkey-latest.osm.pbf &&
          osrm-extract -p /opt/car.lua /data/turkey-latest.osm.pbf &&
          osrm-partition /data/turkey-latest.osrm &&
          osrm-customize /data/turkey-latest.osrm; fi &&
        osrm-routed --algorithm mld /data/turkey-latest.osrm
          --port 5000 --max-table-size 1000"
    ports: ["5000:5000"]
    networks: [aidep-net]

  minio:
    image: minio/minio:RELEASE.2024-01-31T20-20-33Z
    container_name: aidep-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: "${MINIO_ACCESS_KEY:-aidep_minio}"
      MINIO_ROOT_PASSWORD: "${MINIO_SECRET_KEY}"
    volumes: [miniodata:/data]
    ports: ["9001:9001"]
    networks: [aidep-net]

  adminer:
    image: adminer:4.8.1
    container_name: aidep-adminer
    ports: ["8080:8080"]
    networks: [aidep-net]

volumes:
  pgdata:    {name: aidep_pgdata}
  osrmdata:  {name: aidep_osrmdata}
  miniodata: {name: aidep_miniodata}
networks:
  aidep-net: {name: aidep_network, driver: bridge}
"""),
  ("docker/docker-compose.prod.yml", "version: '3.9'\n# TODO: Issue DOC-001\nservices: {}\n"),

  # ── NGINX / POSTGRES ─────────────────────────────────────────
  ("nginx/nginx.conf", """\
events { worker_connections 1024; }
http {
  map $http_upgrade $connection_upgrade { default upgrade; '' close; }
  upstream backend  { server backend:8000; }
  upstream frontend { server frontend:3000; }
  server {
    listen 80;
    client_max_body_size 20M;
    location /api/ { proxy_pass http://backend/api/; proxy_set_header Host $host; }
    location /ws/  {
      proxy_pass http://backend/ws/;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection $connection_upgrade;
      proxy_read_timeout 3600s;
    }
    location /docs  { proxy_pass http://backend/docs; }
    location /redoc { proxy_pass http://backend/redoc; }
    location / { proxy_pass http://frontend/; proxy_set_header Host $host; }
  }
}
"""),
  ("postgres/init.sql", "CREATE EXTENSION IF NOT EXISTS postgis;\nCREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n"),
  ("ml_models/.gitkeep", ""),
  ("secrets/.gitkeep",   ""),

  # ══════════════════════════════════════════════════════════════
  #  BACKEND
  # ══════════════════════════════════════════════════════════════
  ("backend/README.md", "# Backend\nFastAPI + SQLAlchemy + Alembic + uv\n"),
  ("backend/PROJECT_STRUCTURE.md", """\
# Backend Yapısı

app/api/          → HTTP route'ları + dependency injection
app/authentication/ → Firebase JWT doğrulama
app/core/         → Config, DB bağlantısı, Redis
app/crud/         → Veritabanı CRUD işlemleri
app/data/         → Seed ve başlangıç verileri
app/logic/        → İş mantığı (Greedy, risk skoru) — AI servisinden bağımsız
app/schemas/      → Pydantic modeller
app/services/     → Dış servis çağrıları (ai_service, osrm, minio)
"""),
  ("backend/Dockerfile", """\
FROM python:3.11-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/.venv /app/.venv
COPY . .
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""),
  ("backend/.dockerignore", "__pycache__\n*.pyc\n.venv\ntests/\n"),
  ("backend/.gitignore",    ".env\n.venv/\n__pycache__/\n*.pyc\n.coverage\n"),
  ("backend/pyproject.toml", """\
[project]
name = "aidep-backend"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
  "fastapi>=0.110.0",
  "uvicorn[standard]>=0.27.1",
  "sqlalchemy[asyncio]>=2.0.28",
  "asyncpg>=0.29.0",
  "alembic>=1.13.1",
  "geoalchemy2>=0.14.6",
  "pydantic>=2.6.3",
  "pydantic-settings>=2.2.1",
  "httpx>=0.27.0",
  "firebase-admin>=6.4.0",
  "redis>=5.0.2",
  "minio>=7.2.5",
  "cryptography>=42.0.5",
  "python-multipart>=0.0.9",
  "pillow>=10.2.0",
  "beautifulsoup4>=4.12.0",
]
[project.optional-dependencies]
dev = ["pytest>=8.1.1","pytest-asyncio>=0.23.5","ruff>=0.3.3","httpx>=0.27.0"]
[tool.ruff]
line-length = 100
[tool.ruff.lint]
select = ["E","W","F","I","UP"]
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
"""),
  ("backend/uv.lock",    "# uv lock — uv sync çalışınca güncellenir\n"),
  ("backend/alembic.ini","""\
[alembic]
script_location = app/alembic
sqlalchemy.url = postgresql+asyncpg://aidep:pass@localhost:5432/aidep_db
[loggers]
keys = root,sqlalchemy,alembic
[handlers]
keys = console
[formatters]
keys = generic
[logger_root]
level = WARN
handlers = console
[logger_sqlalchemy]
level = WARN
handlers =
[logger_alembic]
level = INFO
handlers =
qualname = alembic
[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic
[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
"""),

  # app kök
  ("backend/app/__init__.py", ""),
  ("backend/app/main.py", """\
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="AIDEP API",
    version="1.0.0",
    description="AI Destekli Deprem Afet Yönetim Platformu | Teknosel 2026 OÜ2662",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.environment == "development" else [],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)
# TODO: router'ları ekle — Issue BE1-001
@app.get("/api/v1/health", tags=["health"])
async def health():
    return {"status": "ok", "version": "1.0.0"}
"""),
  ("backend/app/models.py",         "# SQLAlchemy ORM modelleri — Issue BE1-004\n"),
  ("backend/app/mongodb_models.py",  "# MongoDB modelleri (mesh offline sync için)\n"),
  ("backend/app/initial_data.py",    "import asyncio\nfrom app.data.seed_demo import seed\nif __name__ == '__main__': asyncio.run(seed())\n"),
  ("backend/app/backend_pre_start.py","# DB bağlantı kontrolü başlatma öncesi\n"),

  # alembic
  ("backend/app/alembic/env.py", """\
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
from app.core.config import settings
from app.models import Base  # noqa

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)
target_metadata = Base.metadata
config.set_main_option("sqlalchemy.url", settings.database_url)

def run_offline():
    context.configure(url=settings.database_url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def do_run(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_online():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.", poolclass=pool.NullPool,
    )
    async with connectable.connect() as conn:
        await conn.run_sync(do_run)
    await connectable.dispose()

if context.is_offline_mode():
    run_offline()
else:
    asyncio.run(run_online())
"""),
  ("backend/app/alembic/script.py.mako", """\
\"\"\"${message}\"\"\"
from alembic import op
import sqlalchemy as sa
import geoalchemy2
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}
def upgrade() -> None:
    ${upgrades if upgrades else "pass"}
def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
"""),
  ("backend/app/alembic/versions/.gitkeep", ""),

  # api
  ("backend/app/api/__init__.py", ""),
  ("backend/app/api/main.py", "from fastapi import APIRouter\napi_router = APIRouter()\n# TODO: router include'ları\n"),
  ("backend/app/api/dependencies/__init__.py", ""),
  ("backend/app/api/dependencies/auth.py", """\
# Firebase JWT doğrulama — Issue BE1-005, BE1-006
# Roller: admin | afad | stk | volunteer | victim
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
bearer = HTTPBearer()
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    raise NotImplementedError("Issue BE1-005")
def require_role(*roles: str):
    async def checker(user=Depends(get_current_user)):
        raise NotImplementedError("Issue BE1-006")
    return checker
"""),
  ("backend/app/api/dependencies/db.py", """\
from app.core.db import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
"""),
  ("backend/app/api/routes/__init__.py", ""),
] + [
  (f"backend/app/api/routes/{name}.py",
   f"# {name} routes — Issue {issue}\nfrom fastapi import APIRouter\nrouter = APIRouter()\n")
  for name, issue in [
    ("auth",        "BE1-005"),
    ("users",       "BE1-007"),
    ("requests",    "BE1-008, BE1-009"),
    ("volunteers",  "BE1-010, BE1-011"),
    ("damage",      "BE1-013, BE1-014"),
    ("routing",     "BE2-003"),
    ("matching",    "BE2-008"),
    ("earthquakes", "BE2-006, BE2-007"),
    ("exercises",   "BE2-012"),
    ("websocket",   "BE2-004, BE2-005"),
  ]
] + [

  # authentication
  ("backend/app/authentication/__init__.py", ""),
  ("backend/app/authentication/firebase.py", """\
# Firebase Admin SDK — Issue BE1-005
import firebase_admin
from firebase_admin import auth, credentials, messaging
from app.core.config import settings
_init = False
def _start():
    global _init
    if not _init:
        try:
            cred = credentials.Certificate(settings.firebase_credentials_path)
            firebase_admin.initialize_app(cred)
            _init = True
        except Exception as e:
            print(f"Firebase başlatılamadı: {e}")
def verify_id_token(token: str) -> dict:
    _start(); return auth.verify_id_token(token)
def send_fcm(token: str, title: str, body: str, data: dict = None) -> bool:
    try:
        _start()
        messaging.send(messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {}, token=token))
        return True
    except Exception: return False
"""),
  ("backend/app/authentication/jwt.py", "# JWT yardımcıları\n"),

  # core
  ("backend/app/core/__init__.py", ""),
  ("backend/app/core/config.py", """\
from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    environment: str = "development"
    database_url: str = "postgresql+asyncpg://aidep:pass@postgres:5432/aidep_db"
    redis_url: str = "redis://redis:6379/0"
    osrm_url: str = "http://osrm:5000"
    ai_service_url: str = "http://ai:8001"    # YOLOv8m + XGBoost (AI-011, AI-012)
    minio_endpoint: str = "minio:9000"
    minio_access_key: str = ""
    minio_secret_key: str = ""
    minio_secure: bool = False
    firebase_credentials_path: str = "/secrets/firebase-service-account.json"
    secret_key: str = "change-me"
    afad_api_key: str = ""
    model_config = SettingsConfigDict(env_file="../docker/.env.dev", extra="ignore")
settings = Settings()
"""),
  ("backend/app/core/db.py", """\
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings
engine = create_async_engine(settings.database_url, pool_size=10, max_overflow=20,
                              echo=settings.environment == "development")
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
class Base(DeclarativeBase): pass
"""),
  ("backend/app/core/redis.py", """\
import redis.asyncio as aioredis
from app.core.config import settings
_client = None
def get_redis() -> aioredis.Redis:
    global _client
    if _client is None:
        _client = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _client
"""),
  ("backend/app/core/security.py", "# AES-256 şifreleme (KVKK) — Issue BE2-009\n"),
  ("backend/app/core/logging.py",  "# Uygulama log yapılandırması\n"),

  # crud
  ("backend/app/crud/__init__.py", ""),
  ("backend/app/crud/base.py", """\
from typing import Any, Generic, TypeVar
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import Base
M = TypeVar("M", bound=Base)
class CRUDBase(Generic[M]):
    def __init__(self, model: type[M]): self.model = model
    async def get(self, db: AsyncSession, id: Any) -> M | None:
        return await db.get(self.model, id)
    async def get_multi(self, db: AsyncSession, skip=0, limit=20) -> list[M]:
        r = await db.execute(select(self.model).offset(skip).limit(limit))
        return r.scalars().all()
    async def create(self, db: AsyncSession, obj: M) -> M:
        db.add(obj); await db.flush(); await db.refresh(obj); return obj
    async def delete(self, db: AsyncSession, obj: M) -> None:
        await db.delete(obj); await db.flush()
"""),
] + [
  (f"backend/app/crud/{n}.py", f"# {n} CRUD — Issue {i}\nfrom app.crud.base import CRUDBase\n")
  for n, i in [
    ("user","BE1-007"),("request","BE1-008"),("volunteer","BE1-010"),
    ("damage_report","BE1-013"),("route","BE2-003"),("earthquake","BE2-006"),
  ]
] + [

  # data
  ("backend/app/data/__init__.py", ""),
  ("backend/app/data/seed_demo.py", """\
\"\"\"
Demo verisi — make seed
Kahramanmaraş koordinatları etrafında (Issue BE2-016)
\"\"\"
import asyncio

# Rapor: Kahramanmaraş retroaktif simülasyon (BE2-013)
KAHRAMANMARAS_DAMAGE = [
    (37.5753, 36.9228, "road_blocked"),
    (37.5820, 36.9310, "building_collapse"),
    (37.5689, 36.9150, "road_damaged"),
    (37.5901, 36.9450, "road_blocked"),
    (37.5634, 36.9080, "building_damaged"),
    (37.5780, 36.9380, "debris_pile"),
    (37.5712, 36.9201, "road_damaged"),
    (37.5845, 36.9290, "building_collapse"),
    (37.5670, 36.9170, "road_blocked"),
    (37.5923, 36.9420, "clear"),
]
DEMO_USERS = [
    {"role": "admin",     "email": "admin@aidep.test",    "display_name": "Admin"},
    {"role": "afad",      "email": "afad@aidep.test",     "display_name": "AFAD Koordinatör"},
    {"role": "stk",       "email": "stk@aidep.test",      "display_name": "STK Yönetici"},
    {"role": "volunteer", "email": "vol1@aidep.test",     "display_name": "Gönüllü 1"},
    {"role": "volunteer", "email": "vol2@aidep.test",     "display_name": "Gönüllü 2"},
]
async def seed():
    print(f"{len(DEMO_USERS)} kullanıcı, {len(KAHRAMANMARAS_DAMAGE)} hasar noktası hazır")
    # TODO: DB'ye ekle
if __name__ == "__main__":
    asyncio.run(seed())
"""),
  ("backend/app/data/kahramanmaras_damage.json", '{"_comment":"6 Şubat 2023 Kahramanmaraş hasar noktaları — Issue BE2-013","damage_points":[]}\n'),

  # ─────────────────────────────────────────────────────────────
  # LOGIC — Enhanced Greedy + Risk Skoru BURADA
  # Rapor: bu iki bileşen hafif Python, GPU gerektirmiyor
  # ─────────────────────────────────────────────────────────────
  ("backend/app/logic/__init__.py", ""),

  ("backend/app/logic/greedy_algorithm.py", """\
\"\"\"
Enhanced Greedy Eşleştirme Algoritması
=======================================
Rapor §3.3:
  - O(n log n + n×m) karmaşıklık
  - %95-98 optimal (Hungarian'ın O(n³)'e karşı)
  - cost = 0.7 × süre + 0.3 × (100 - öncelik_skoru)
  - Constraint: max 3 görev/gün, 06:00-23:00

Issue: AI-013, AI-014
\"\"\"
from dataclasses import dataclass, field


@dataclass
class MatchRequest:
    id: int
    priority_score: float    # XGBoost çıktısı (0-100)
    type: str                # rescue | medical | shelter | food
    lat: float
    lng: float


@dataclass
class MatchVolunteer:
    id: str
    skills: list[str] = field(default_factory=list)
    lat: float = 0.0
    lng: float = 0.0
    current_load: int = 0    # Aktif görev sayısı (max 3)


@dataclass
class Match:
    request_id: int
    volunteer_id: str
    eta_min: float
    cost: float


# Beceri kısıtları (Rapor §3.3)
SKILL_MAP = {
    "rescue":  "arama_kurtarma",
    "medical": "tibbi_yardim",
}


async def run_matching(
    requests: list[MatchRequest],
    volunteers: list[MatchVolunteer],
) -> dict:
    \"\"\"
    Enhanced Greedy eşleştirme — Rapor §3.3
    Returns: {"matches": [...], "unmatched": [...]}
    Süre: 100 talep × 50 gönüllü ≈ 0.5 sn, 1000×200 ≈ 2 sn
    \"\"\"
    if not requests or not volunteers:
        return {"matches": [], "unmatched": [r.id for r in requests]}

    # Adım 1: Önceliğe göre azalan sırala  O(n log n)
    sorted_reqs = sorted(requests, key=lambda r: r.priority_score, reverse=True)

    matches: list[Match] = []
    unmatched: list[int] = []
    busy: set[str] = set()

    # Adım 2: Eşleştirme döngüsü  O(n×m)
    for req in sorted_reqs:
        available = [
            v for v in volunteers
            if v.id not in busy
            and v.current_load < 3          # constraint: max 3 görev
            and _skill_ok(req, v)            # constraint: beceri uyumu
        ]
        if not available:
            unmatched.append(req.id)
            continue

        best = min(available, key=lambda v: _cost(req, v))
        busy.add(best.id)
        matches.append(Match(
            request_id=req.id,
            volunteer_id=best.id,
            eta_min=_eta(req, best),
            cost=_cost(req, best),
        ))

    # Adım 3: Lokal swap optimizasyonu (opsiyonel, 2 iterasyon)
    # TODO: son 10 eşleşmede swap dene

    return {"matches": matches, "unmatched": unmatched}


def _skill_ok(req: MatchRequest, vol: MatchVolunteer) -> bool:
    required = SKILL_MAP.get(req.type)
    return required is None or required in vol.skills


def _cost(req: MatchRequest, vol: MatchVolunteer) -> float:
    \"\"\"Rapor: cost = 0.7×süre + 0.3×(100-öncelik)\"\"\"
    return 0.7 * _eta(req, vol) + 0.3 * (100 - req.priority_score)


def _eta(req: MatchRequest, vol: MatchVolunteer) -> float:
    \"\"\"
    Yaklaşık ETA (dakika).
    Gerçek implementasyonda OSRM table API kullanılır (BE2-001).
    \"\"\"
    import math
    dist_km = math.sqrt((req.lat - vol.lat)**2 + (req.lng - vol.lng)**2) * 111
    return dist_km / 40 * 60   # 40 km/h
"""),

  ("backend/app/logic/risk_scoring.py", """\
\"\"\"
Rota Risk Skoru Hesaplama
=========================
Rapor §3.3: YOLOv8m hasar verisi + OSRM rota segmentleri

Hasar sınıf → risk skoru:
  road_blocked:      5.0  ← bu segmenti kullanma!
  building_collapse: 5.0
  road_damaged:      2.0
  building_damaged:  2.0
  debris_pile:       1.5
  road_passable:     0.5
  clear:             0.0
  pending:           1.0  ← henüz analiz edilmemiş

risk_score = Σ(segment_skor) / (n × max_skor)  → 0-1
final_cost = 0.7 × süre + 0.3 × risk_score

Issue: BE2-002
\"\"\"

DAMAGE_SCORES: dict[str, float] = {
    "road_blocked":      5.0,
    "building_collapse": 5.0,
    "road_damaged":      2.0,
    "building_damaged":  2.0,
    "debris_pile":       1.5,
    "road_passable":     0.5,
    "clear":             0.0,
    "pending":           1.0,
}
_MAX = 5.0


def route_risk_score(segment_classes: list[str]) -> float:
    \"\"\"0.0 (güvenli) → 1.0 (çok riskli)\"\"\"
    if not segment_classes:
        return 0.0
    total = sum(DAMAGE_SCORES.get(c, 1.0) for c in segment_classes)
    return min(total / (len(segment_classes) * _MAX), 1.0)


def is_route_safe(segment_classes: list[str]) -> bool:
    \"\"\"road_blocked segmenti varsa direkt False (Rapor: riskli segmenti bypass et)\"\"\"
    if "road_blocked" in segment_classes:
        return False
    return route_risk_score(segment_classes) < 0.8
"""),

  ("backend/app/logic/damage_pipeline.py", """\
\"\"\"
Hasar Tespit Pipeline
======================
Rapor §3.3: Çoklu teyit yöntemi
  3+ fotoğraf → YOLOv8m ile analiz → skorları ortala → güven skoru
  confidence > 0.7 → otomatik onay
  0.4-0.7 → manuel kontrol
  < 0.4   → red

Issue: BE1-013
\"\"\"
# TODO: Issue BE1-013
async def process_damage_report(image_base64: str, lat: float, lng: float, user_id: str) -> dict:
    raise NotImplementedError("Issue BE1-013")
"""),

  ("backend/app/logic/routing_logic.py",   "# Güvenli rota iş mantığı — Issue BE2-002, BE2-003\n"),
  ("backend/app/logic/matching_logic.py",  "# Eşleştirme servis katmanı — Issue BE2-008\n"),

  # schemas
  ("backend/app/schemas/__init__.py", ""),
] + [
  (f"backend/app/schemas/{n}.py", f"# {n} Pydantic şema — Issue {i}\nfrom pydantic import BaseModel\n")
  for n, i in [
    ("user","BE1-007"),("request","BE1-008"),("volunteer","BE1-010"),
    ("damage_report","BE1-013"),("route","BE2-003"),("earthquake","BE2-006"),
    ("exercise","BE2-012"),("token","BE1-005"),
  ]
] + [

  # services — dış servis çağrıları
  ("backend/app/services/__init__.py", ""),
  ("backend/app/services/ai_service.py", """\
\"\"\"
AI Servisi HTTP İstemcisi
===========================
ai-service container'ına HTTP istek atar.

POST /detect      → YOLOv8m hasar tespiti (Issue AI-011)
POST /prioritize  → XGBoost önceliklendirme (Issue AI-012)
GET  /health      → Servis durumu

Issue: AI-011, AI-012
\"\"\"
import httpx
from app.core.config import settings


async def detect_damage(image_base64: str, lat: float, lng: float) -> dict:
    \"\"\"
    YOLOv8m ile hasar tespiti.
    Rapor §3.3: 7 sınıf → dominant sınıf + severity (1-5)
    \"\"\"
    async with httpx.AsyncClient(timeout=15.0) as c:
        r = await c.post(f"{settings.ai_service_url}/detect",
                         json={"image_base64": image_base64,
                               "location": {"lat": lat, "lng": lng}})
        r.raise_for_status()
        return r.json()


async def prioritize_requests(requests: list[dict]) -> list[dict]:
    \"\"\"
    XGBoost ile talep önceliklendirme.
    Rapor §3.3: 7 özellik → 0-100 skor → azalan sıralı liste
    \"\"\"
    async with httpx.AsyncClient(timeout=10.0) as c:
        r = await c.post(f"{settings.ai_service_url}/prioritize",
                         json={"requests": requests})
        r.raise_for_status()
        return r.json()["ranked_requests"]
"""),

  ("backend/app/services/osrm_service.py", """\
\"\"\"
OSRM Rota Motoru İstemcisi
============================
Türkiye OSM verisi, güvenli rota hesaplama.
Enhanced Greedy için distance_table kullanılır.

Issue: BE2-001
\"\"\"
import httpx
from app.core.config import settings


async def get_route(origin: tuple, destination: tuple, alternatives: int = 3) -> dict:
    coords = f"{origin[1]},{origin[0]};{destination[1]},{destination[0]}"
    async with httpx.AsyncClient(timeout=10.0) as c:
        r = await c.get(f"{settings.osrm_url}/route/v1/driving/{coords}",
                        params={"alternatives": alternatives,
                                "geometries": "geojson", "steps": "true"})
        r.raise_for_status()
        return r.json()


async def get_distance_table(coords: list[tuple]) -> list[list[float]]:
    \"\"\"Toplu mesafe matrisi — Enhanced Greedy için (AI-013)\"\"\"
    s = ";".join(f"{lng},{lat}" for lat, lng in coords)
    async with httpx.AsyncClient(timeout=15.0) as c:
        r = await c.get(f"{settings.osrm_url}/table/v1/driving/{s}",
                        params={"annotations": "duration"})
        r.raise_for_status()
        return r.json()["durations"]
"""),

  ("backend/app/services/minio_service.py",       "# MinIO depolama — Issue BE1-012\n"),
  ("backend/app/services/firebase_service.py",    "# Firebase Realtime DB — Issue MOB-015\n"),
  ("backend/app/services/afad_service.py",        "# AFAD + Kandilli + USGS — Issue BE2-006, BE2-007\n"),
  ("backend/app/services/notification_service.py","# FCM push bildirimleri — Issue BE2-011\n"),
  ("backend/app/services/websocket_manager.py", """\
# WebSocket bağlantı yöneticisi + Redis pub/sub — Issue BE2-004, BE2-005
# Olaylar: damage_report_new | route_updated | volunteer_location | system_alert
from fastapi import WebSocket
class ConnectionManager:
    def __init__(self): self.active: dict[str, WebSocket] = {}
    async def connect(self, cid: str, ws: WebSocket):
        await ws.accept(); self.active[cid] = ws
    def disconnect(self, cid: str): self.active.pop(cid, None)
    async def broadcast(self, event: str, payload: dict):
        dead = []
        for cid, ws in self.active.items():
            try: await ws.send_json({"event": event, "payload": payload})
            except: dead.append(cid)
        for cid in dead: self.disconnect(cid)
ws_manager = ConnectionManager()
"""),

  # utils
  ("backend/app/utils/__init__.py", ""),
  ("backend/app/utils/constants.py", """\
# Proje genelinde kullanılan sabitler
# Gönüllü yetenekleri
VALID_SKILLS = {"ilk_yardim","arama_kurtarma","tibbi_yardim","arac_kullanma","agir_ekipman"}
# need_type → öncelik ağırlığı (Rapor §3.3)
NEED_TYPE_WEIGHT = {"rescue": 1.0, "medical": 0.9, "shelter": 0.6, "food": 0.4}
"""),

  # tests
  ("backend/tests/__init__.py", ""),
  ("backend/tests/conftest.py", """\
import pytest
from httpx import AsyncClient
from app.main import app
@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
"""),
  ("backend/tests/unit/__init__.py", ""),
  ("backend/tests/unit/test_greedy.py", """\
# Enhanced Greedy birim testleri — Issue AI-014
import pytest
from app.logic.greedy_algorithm import MatchRequest, MatchVolunteer, _skill_ok

def test_rescue_needs_arama_kurtarma():
    req = MatchRequest(1, 90, "rescue", 37.57, 36.93)
    ok  = MatchVolunteer("v1", ["arama_kurtarma"], 37.57, 36.93)
    bad = MatchVolunteer("v2", ["ilk_yardim"],     37.57, 36.93)
    assert _skill_ok(req, ok)  is True
    assert _skill_ok(req, bad) is False

def test_food_no_skill_required():
    req = MatchRequest(2, 30, "food", 37.57, 36.93)
    vol = MatchVolunteer("v1", [], 37.57, 36.93)
    assert _skill_ok(req, vol) is True
"""),
  ("backend/tests/unit/test_risk_scoring.py", """\
# Risk skoru birim testleri — Issue BE2-002
from app.logic.risk_scoring import route_risk_score, is_route_safe

def test_clear_route():
    assert route_risk_score(["clear","clear","clear"]) == 0.0

def test_blocked_route_unsafe():
    assert is_route_safe(["clear","road_blocked","clear"]) is False

def test_mixed_route():
    score = route_risk_score(["clear","road_damaged","road_passable"])
    assert 0 < score < 1
"""),
  ("backend/tests/integration/__init__.py", ""),
  ("backend/tests/integration/test_health.py", """\
import pytest
@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
"""),
  ("backend/tests/integration/test_requests.py", "# Yardım talebi testleri — Issue BE1-008\nimport pytest\n"),
  ("backend/tests/e2e/__init__.py", ""),
  ("backend/tests/e2e/test_full_cycle.py", """\
\"\"\"
Tam Yardım Döngüsü E2E — Issue BE2-015
fotoğraf → YOLOv8 → talep → XGBoost → Greedy → OSRM → atama → tamamla
≤ 30 sn
\"\"\"
import pytest
"""),
  ("backend/tests/e2e/test_kahramanmaras_simulation.py", """\
\"\"\"
Kahramanmaraş Retroaktif Simülasyon — Issue BE2-013
Hedef: riskli segment %60 → %10 altı
10 rota çifti, Geleneksel vs AIDEP karşılaştırması
\"\"\"
import pytest, json, os

def load_data():
    p = os.path.join(os.path.dirname(__file__), "../../app/data/kahramanmaras_damage.json")
    return json.load(open(p))

@pytest.mark.asyncio
async def test_route_comparison():
    pytest.skip("Kahramanmaraş verisi hazırlanınca aktif et — Issue BE2-013")
"""),
  ("backend/scripts/format.sh", "#!/bin/bash\nuv run ruff format .\n"),
  ("backend/scripts/lint.sh",   "#!/bin/bash\nuv run ruff check .\n"),
  ("backend/scripts/test.sh",   "#!/bin/bash\nuv run pytest tests/ -v --tb=short\n"),

  # ══════════════════════════════════════════════════════════════
  #  AI SERVİSİ
  #  NEDEN AYRI SERVİS?
  #    1. YOLOv8m GPU gerektirir (backend'e gömmek zor)
  #    2. Modeller bağımsız güncellenebilir
  #    3. backend/app/logic/ → Enhanced Greedy (hafif Python, GPU yok)
  # ══════════════════════════════════════════════════════════════
  ("ai-service/README.md", """\
# AIDEP AI Servisi

FastAPI tabanlı inference servisi (Port: 8001)

## Modeller (Rapor §3.3)

| Model | Görev | Hedef Metrik |
|-------|-------|-------------|
| YOLOv8m | 7 sınıf hasar tespiti | mAP@50 ≥ 0.85 |
| XGBoost | 7 özellik → 0-100 skor | R² ≥ 0.85, MAE < 10 |

## Endpoint'ler
GET  /health        → yolo_loaded + xgboost_loaded
POST /detect        → YOLOv8m hasar tespiti (Issue AI-011)
POST /prioritize    → XGBoost önceliklendirme (Issue AI-012)

## Enhanced Greedy NEREDE?
backend/app/logic/greedy_algorithm.py — hafif Python, GPU gerektirmiyor.
ai-service sadece ağır model inference'ı yapar.

## Model Dosyaları
ml_models/
├── yolov8m_aidep.pt        # AI-002 tamamlanınca ekle
└── xgboost_priority.pkl    # AI-009 tamamlanınca ekle
"""),
  ("ai-service/Dockerfile", """\
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \\
    libgl1 libsm6 libxext6 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync
COPY . .
EXPOSE 8001
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
"""),
  ("ai-service/pyproject.toml", """\
[project]
name = "aidep-ai-service"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
  "fastapi>=0.110.0",
  "uvicorn[standard]>=0.27.1",
  "pydantic>=2.6.3",
  "ultralytics>=8.1.0",      # YOLOv8m — Issue AI-005
  "xgboost>=2.0.3",          # XGBoost  — Issue AI-009
  "joblib>=1.3.2",
  "numpy>=1.26.4",
  "pillow>=10.2.0",
  "opencv-python-headless>=4.9.0.80",
  "httpx>=0.27.0",
  "minio>=7.2.5",
]
[project.optional-dependencies]
dev = ["pytest>=8.1.1","pytest-asyncio>=0.23.5"]
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
"""),
  ("ai-service/uv.lock",    "# uv lock — uv sync çalışınca güncellenir\n"),
  ("ai-service/app/__init__.py", ""),
  ("ai-service/app/config.py", """\
import os
YOLO_PATH    = os.getenv("YOLO_MODEL_PATH",    "/models/yolov8m_aidep.pt")
XGBOOST_PATH = os.getenv("XGBOOST_MODEL_PATH", "/models/xgboost_priority.pkl")
MINIO_ENDPOINT   = os.getenv("MINIO_ENDPOINT",   "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
"""),
  ("ai-service/app/schemas.py", """\
\"\"\"
AI Servis Pydantic Şemaları — Rapor §3.3
\"\"\"
from pydantic import BaseModel

# ── /detect — YOLOv8m 7 sınıf ────────────────────────────────
class DetectRequest(BaseModel):
    image_base64: str
    location: dict           # {lat, lng}
    threshold: float = 0.5

class Detection(BaseModel):
    class_name: str          # road_blocked|road_passable|road_damaged|
                             # building_collapse|building_damaged|debris_pile|clear
    confidence: float        # 0-1
    bbox: list[float]        # [x1,y1,x2,y2]

class DetectResponse(BaseModel):
    detections: list[Detection]
    damage_class: str        # baskın sınıf
    severity: int            # 1-5
    processing_time_ms: float

# ── /prioritize — XGBoost 7 özellik ──────────────────────────
# Rapor §3.3: urgency, waiting_time, distance, need_type,
#              weather_score, population, damage_score
class RequestItem(BaseModel):
    id: int
    urgency_level: int = 1           # 1-5 (aciliyet, ağırlık %25)
    waiting_time_min: float = 0.0    # bekleme süresi (%20)
    distance_km: float = 5.0         # en yakın gönüllü mesafesi (%10)
    need_type: str = "food"          # rescue|medical|shelter|food (%18)
    weather_score: float = 0.0       # MGM API 0-100 (%5)
    population: int = 1              # kişi sayısı (%7)
    damage_score: float = 0.0        # YOLOv8 çıktısı 0-100 (%15)

class RankedItem(BaseModel):
    id: int
    priority_score: float    # 0-100
    rank: int

class PrioritizeRequest(BaseModel):
    requests: list[RequestItem]

class PrioritizeResponse(BaseModel):
    ranked_requests: list[RankedItem]
    processing_time_ms: float
"""),
  ("ai-service/app/main.py", """\
\"\"\"AIDEP AI Servisi — YOLOv8m + XGBoost Inference\"\"\"
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.models.yolo_model import YOLOModel
from app.models.xgboost_model import XGBoostModel
from app.config import YOLO_PATH, XGBOOST_PATH


class State:
    yolo: YOLOModel | None = None
    xgb:  XGBoostModel | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    State.yolo = YOLOModel(YOLO_PATH)
    State.xgb  = XGBoostModel(XGBOOST_PATH)
    yield


app = FastAPI(
    title="AIDEP AI Servisi",
    version="1.0.0",
    description="YOLOv8m hasar tespiti + XGBoost önceliklendirme | Teknosel 2026",
    lifespan=lifespan,
)

from app.routers import health, detect, prioritize
app.include_router(health.router,     tags=["health"])
app.include_router(detect.router,     tags=["detect"])
app.include_router(prioritize.router, tags=["prioritize"])
"""),
  ("ai-service/app/models/__init__.py", ""),
  ("ai-service/app/models/yolo_model.py", """\
\"\"\"
YOLOv8m Model Wrapper — Rapor §3.3
====================================
7 sınıf:
  0 road_blocked      — Enkaz/çöküntü ile kapanan yol
  1 road_passable     — Hasarlı ama geçilebilir
  2 road_damaged      — Yüzey hasarı, yavaş geçiş
  3 building_collapse — Tamamen/kısmen çökmüş
  4 building_damaged  — Ayakta ama hasarlı
  5 debris_pile       — Enkaz yığını
  6 clear             — Hasar yok, güvenli

Eğitim (Rapor §3.3):
  - COCO pretrained → fine-tuning (transfer learning)
  - Veri: %60 train / %20 val / %20 test
  - Augmentation: flip, brightness, noise, rotation, mosaic
  - Hedef: mAP@50 ≥ 0.85

Issue: AI-005, AI-006
\"\"\"
from pathlib import Path

SEVERITY_MAP = {
    "road_blocked": 5, "building_collapse": 5,
    "road_damaged": 3, "building_damaged": 3,
    "debris_pile":  2, "road_passable": 1, "clear": 0,
}
CLASS_NAMES = list(SEVERITY_MAP.keys())


class YOLOModel:
    def __init__(self, path: str):
        self.path = path
        self.model = None
        self.loaded = False
        self._load()

    def _load(self):
        if not Path(self.path).exists():
            print(f"[AI] YOLOv8m model yok: {self.path}")
            print("[AI] Eğitim tamamlanınca ml_models/ klasörüne ekleyin")
            return
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.path)
            self.loaded = True
            print(f"[AI] YOLOv8m yüklendi: {self.path}")
        except Exception as e:
            print(f"[AI] YOLOv8m yüklenemedi: {e}")

    def predict(self, image, threshold: float = 0.5) -> list[dict]:
        if not self.loaded:
            return [{"class_name": "pending", "confidence": 0.0, "bbox": []}]
        results = self.model.predict(image, conf=threshold, verbose=False)
        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class_name": self.model.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": box.xyxy[0].tolist(),
                })
        return detections

    @staticmethod
    def dominant(detections: list[dict]) -> tuple[str, int]:
        if not detections or detections[0]["class_name"] == "pending":
            return "pending", 0
        best = max(detections, key=lambda d: d["confidence"])
        cls = best["class_name"]
        return cls, SEVERITY_MAP.get(cls, 0)
"""),
  ("ai-service/app/models/xgboost_model.py", """\
\"\"\"
XGBoost Model Wrapper — Rapor §3.3
=====================================
7 giriş özelliği → 0-100 öncelik skoru

Feature ağırlıkları (XGBoost tarafından öğrenilir, bunlar başlangıç referansı):
  urgency_level    %25  (en önemli)
  waiting_time_min %20
  need_type_weight %18
  damage_score     %15
  distance_km      %10
  population        %7
  weather_score     %5

Eğitim (Rapor §3.3):
  - Grid Search + 5-katlı çapraz doğrulama
  - Hedef: R² ≥ 0.85, MAE < 10
  - Veri: Kahramanmaraş retrospektif + uzman senaryoları

Issue: AI-009
\"\"\"
from pathlib import Path

NEED_TYPE_MAP = {"rescue": 1.0, "medical": 0.9, "shelter": 0.6, "food": 0.4}


class XGBoostModel:
    def __init__(self, path: str):
        self.path = path
        self.model = None
        self.loaded = False
        self._load()

    def _load(self):
        if not Path(self.path).exists():
            print(f"[AI] XGBoost model yok: {self.path}")
            print("[AI] Kural tabanlı fallback aktif (eğitim sonrası değiştirilecek)")
            return
        try:
            import joblib
            self.model = joblib.load(self.path)
            self.loaded = True
            print(f"[AI] XGBoost yüklendi: {self.path}")
        except Exception as e:
            print(f"[AI] XGBoost yüklenemedi: {e}")

    def predict(self, features: list[dict]) -> list[float]:
        if not self.loaded:
            return self._rule_based(features)
        import numpy as np
        X = np.array([[
            f["urgency_level"],
            f["waiting_time_min"],
            f["distance_km"],
            NEED_TYPE_MAP.get(f["need_type"], 0.4),
            f["weather_score"],
            f["population"],
            f["damage_score"],
        ] for f in features])
        raw = self.model.predict(X)
        mn, mx = raw.min(), raw.max()
        return ((raw - mn) / (mx - mn) * 100).tolist() if mx > mn else [50.0] * len(features)

    def _rule_based(self, features: list[dict]) -> list[float]:
        \"\"\"
        Rapor: kural tabanlı fallback
        score = urgency(40%) + waiting(30%) + need_type(20%) + population(10%)
        \"\"\"
        out = []
        for f in features:
            s = (f["urgency_level"] * 20 * 0.40
                 + min(f["waiting_time_min"] / 2, 100) * 0.30
                 + NEED_TYPE_MAP.get(f["need_type"], 0.4) * 100 * 0.20
                 + min(f["population"] * 10, 100) * 0.10)
            out.append(min(round(s, 2), 100.0))
        return out
"""),
  ("ai-service/app/routers/__init__.py", ""),
  ("ai-service/app/routers/health.py", """\
from fastapi import APIRouter
from app.main import State
router = APIRouter()
@router.get("/health")
async def health():
    return {"status":"ok",
            "yolo_loaded":    State.yolo.loaded if State.yolo else False,
            "xgboost_loaded": State.xgb.loaded  if State.xgb  else False,
            "version": "1.0.0"}
"""),
  ("ai-service/app/routers/detect.py", """\
\"\"\"
POST /detect — YOLOv8m Hasar Tespiti
Issue: AI-011
\"\"\"
import base64, time
from io import BytesIO
from fastapi import APIRouter, HTTPException
from PIL import Image
from app.schemas import DetectRequest, DetectResponse, Detection
from app.main import State

router = APIRouter()

@router.post("/detect", response_model=DetectResponse)
async def detect(req: DetectRequest):
    t = time.time()
    try:
        img = Image.open(BytesIO(base64.b64decode(req.image_base64))).convert("RGB")
    except Exception:
        raise HTTPException(422, "Geçersiz base64 görüntü.")
    raw = State.yolo.predict(img, req.threshold)
    cls, sev = State.yolo.dominant(raw)
    return DetectResponse(
        detections=[Detection(**d) for d in raw if d["class_name"] != "pending"],
        damage_class=cls, severity=sev,
        processing_time_ms=(time.time()-t)*1000,
    )
"""),
  ("ai-service/app/routers/prioritize.py", """\
\"\"\"
POST /prioritize — XGBoost Önceliklendirme
Issue: AI-012
\"\"\"
import time
from fastapi import APIRouter
from app.schemas import PrioritizeRequest, PrioritizeResponse, RankedItem
from app.main import State

router = APIRouter()

@router.post("/prioritize", response_model=PrioritizeResponse)
async def prioritize(req: PrioritizeRequest):
    t = time.time()
    if not req.requests:
        return PrioritizeResponse(ranked_requests=[], processing_time_ms=0)
    scores = State.xgb.predict([r.model_dump() for r in req.requests])
    ranked = sorted(zip([r.id for r in req.requests], scores), key=lambda x: x[1], reverse=True)
    return PrioritizeResponse(
        ranked_requests=[RankedItem(id=rid, priority_score=score, rank=i+1)
                         for i, (rid, score) in enumerate(ranked)],
        processing_time_ms=(time.time()-t)*1000,
    )
"""),

  # training
  ("ai-service/training/train_yolo.py", """\
\"\"\"
YOLOv8m Fine-Tuning — Issue AI-005
=====================================
Rapor §3.3:
  Base model: yolov8m.pt (COCO pretrained, transfer learning)
  Veri bölme:  Train %60 / Val %20 / Test %20
  Hedef:       mAP@50 ≥ 0.85
  Augmentation: flip, brightness±20%, Gaussian noise, rotate±15°, mosaic
\"\"\"
from ultralytics import YOLO

def train(data_yaml="datasets/data.yaml"):
    model = YOLO("yolov8m.pt")
    results = model.train(
        data=data_yaml,
        epochs=100, imgsz=640, batch=16,
        lr0=0.001, lrf=0.01, momentum=0.937, weight_decay=0.0005,
        warmup_epochs=3, optimizer="AdamW",
        augment=True, cache=True,
        device="cuda",      # GPU yoksa: "cpu"
        project="runs/train", name="aidep_v1",
        patience=20, save_period=10, exist_ok=True,
    )
    print(f"Best: {results.save_dir}/weights/best.pt")
    return results

if __name__ == "__main__":
    train()
"""),
  ("ai-service/training/train_xgboost.py", """\
\"\"\"
XGBoost Eğitimi — Issue AI-009
================================
Rapor §3.3:
  7 özellik → 0-100 öncelik skoru
  Grid Search + 5-katlı çapraz doğrulama
  Hedef: R² ≥ 0.85, MAE < 10
  Veri: Kahramanmaraş retrospektif + uzman senaryoları (≥1500 kayıt)
\"\"\"
import joblib, pandas as pd
from sklearn.model_selection import GridSearchCV, KFold
from xgboost import XGBRegressor

FEATURES = ["urgency_level","waiting_time_min","distance_km",
            "need_type_enc","weather_score","population","damage_score"]

def train(csv="datasets/xgboost_train.csv"):
    df = pd.read_csv(csv)
    X, y = df[FEATURES], df["priority_score"]
    params = {
        "n_estimators":     [100, 200, 300],
        "max_depth":        [4, 6, 8],
        "learning_rate":    [0.01, 0.05, 0.1],
        "subsample":        [0.8, 1.0],
        "colsample_bytree": [0.8, 1.0],
    }
    gs = GridSearchCV(
        XGBRegressor(objective="reg:squarederror", random_state=42),
        params, cv=KFold(5, shuffle=True, random_state=42),
        scoring="r2", n_jobs=-1, verbose=2,
    )
    gs.fit(X, y)
    print(f"En iyi R²: {gs.best_score_:.4f}")
    joblib.dump(gs.best_estimator_, "../../ml_models/xgboost_priority.pkl")
    print("Kaydedildi: ml_models/xgboost_priority.pkl")
    return gs.best_estimator_

if __name__ == "__main__":
    train()
"""),
  ("ai-service/training/evaluate.py", """\
\"\"\"
Model Değerlendirme — Issue AI-006
====================================
Rapor §3.3 metrikleri:
  YOLOv8m: Confusion matrix, Precision, Recall, F1, mAP@50, ROC-AUC
  XGBoost: R², MAE, 5-katlı CV, SHAP değerleri
\"\"\"
from ultralytics import YOLO

def evaluate_yolo(model_path="../../ml_models/yolov8m_aidep.pt",
                  data_yaml="datasets/data.yaml"):
    model = YOLO(model_path)
    m = model.val(data=data_yaml, split="test")
    print(f"mAP@50:    {m.box.map50:.4f}  (Hedef: ≥ 0.85)")
    print(f"mAP@50-95: {m.box.map:.4f}")
    print(f"Precision: {m.box.mp:.4f}")
    print(f"Recall:    {m.box.mr:.4f}")
    return m

if __name__ == "__main__":
    evaluate_yolo()
"""),
  ("ai-service/training/augment.py", """\
\"\"\"
Veri Augmentation — Issue AI-004
===================================
Rapor §3.3: YOLOv8 train(augment=True) otomatik yapar.
Bu dosya ek offline augmentation içindir.

Teknikler:
  - Yatay/dikey çevirme (flipud, fliplr)
  - Parlaklık/kontrast ±20% (hsv_v, hsv_s)
  - Gaussian gürültü
  - Döndürme ±15° (degrees)
  - Crop & resize (640×640)
  - Mosaic (4 görüntü birleştir)
\"\"\"
"""),
  ("ai-service/datasets/data.yaml", """\
# YOLOv8m Veri Seti — Rapor §3.3
# Veri bölme: Train %60 / Val %20 / Test %20
path: .
train: datasets/train/images
val:   datasets/val/images
test:  datasets/test/images
nc: 7
names:
  0: road_blocked        # Enkaz ile kapanan yol
  1: road_passable       # Hasarlı ama geçilebilir
  2: road_damaged        # Yüzey hasarı, yavaş geçiş
  3: building_collapse   # Tamamen/kısmen çökmüş bina
  4: building_damaged    # Ayakta ama hasarlı bina
  5: debris_pile         # Enkaz yığını
  6: clear               # Hasar yok, güvenli
"""),
  ("ai-service/datasets/README.md", """\
# Veri Seti

Issue: AI-001 (Kahramanmaraş), AI-002 (uluslararası), AI-003 (etiketleme), AI-004 (augmentation)

## Kaynaklar (Rapor §3.3)
- 6 Şubat 2023 Kahramanmaraş (öncelik)
- 2023 Marakeş, 2023 Suriye, 2020 İzmir
- AIDER, RescueNet, xBD açık kaynak veri setleri

## Klasör Yapısı
datasets/
├── raw/          # Ham görüntüler (.gitignore)
├── labeled/      # Roboflow export (.gitignore)
├── train/images/ train/labels/
├── val/images/   val/labels/
└── test/images/  test/labels/

## XGBoost Verisi
xgboost_train.csv: ≥1500 kayıt, 7 özellik + priority_score
"""),
  ("ai-service/tests/__init__.py", ""),
  ("ai-service/tests/test_detect.py", """\
# YOLOv8m detect endpoint testleri — Issue AI-015
import base64, pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac: yield ac

@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_detect_invalid_base64(client):
    r = await client.post("/detect", json={"image_base64":"GECERSIZ!!!","location":{"lat":37.57,"lng":36.93}})
    assert r.status_code == 422
"""),
  ("ai-service/tests/test_prioritize.py", """\
# XGBoost prioritize endpoint testleri — Issue AI-015
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac: yield ac

@pytest.mark.asyncio
async def test_prioritize_empty(client):
    r = await client.post("/prioritize", json={"requests": []})
    assert r.status_code == 200 and r.json()["ranked_requests"] == []

@pytest.mark.asyncio
async def test_urgency_ordering(client):
    r = await client.post("/prioritize", json={"requests": [
        {"id":1,"urgency_level":1,"waiting_time_min":5,"distance_km":5,"need_type":"food","weather_score":0,"population":1,"damage_score":0},
        {"id":2,"urgency_level":5,"waiting_time_min":60,"distance_km":2,"need_type":"rescue","weather_score":30,"population":4,"damage_score":80},
    ]})
    assert r.status_code == 200
    assert r.json()["ranked_requests"][0]["id"] == 2  # Acil olan önce
"""),

  # ══════════════════════════════════════════════════════════════
  #  FRONTEND (Vite + React + TypeScript + Biome)
  # ══════════════════════════════════════════════════════════════
  ("frontend/README.md", "# Frontend\nVite + React + TypeScript + Biome\n"),
  ("frontend/Dockerfile", """\
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx","-g","daemon off;"]
"""),
  ("frontend/Dockerfile.playwright", "FROM mcr.microsoft.com/playwright:v1.42.1-jammy\n"),
  ("frontend/.dockerignore", "node_modules\ndist\n"),
  ("frontend/.gitignore",    "node_modules\ndist\n.env\n"),
  ("frontend/.nvmrc", "20\n"),
  ("frontend/.env.example",    "VITE_API_URL=http://localhost/api\nVITE_WS_URL=ws://localhost/ws\n"),
  ("frontend/.env.development","VITE_API_URL=http://localhost/api\nVITE_WS_URL=ws://localhost/ws\n"),
  ("frontend/index.html", "<!doctype html>\n<html lang=\"tr\"><head><meta charset=\"UTF-8\"/><title>AIDEP</title></head><body><div id=\"root\"></div><script type=\"module\" src=\"/src/main.tsx\"></script></body></html>\n"),
  ("frontend/nginx.conf", "server { listen 3000; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }\n"),
  ("frontend/nginx-backend-not-found.conf", ""),
  ("frontend/package.json", '{"name":"aidep-frontend","version":"1.0.0","private":true,"scripts":{"dev":"vite","build":"tsc -b && vite build","lint":"biome check src/","test":"playwright test"}}\n'),
  ("frontend/tsconfig.json", '{"compilerOptions":{"target":"ES2020","lib":["ES2020","DOM","DOM.Iterable"],"module":"ESNext","moduleResolution":"bundler","strict":true,"jsx":"react-jsx","noEmit":true,"baseUrl":"src"},"include":["src"]}\n'),
  ("frontend/tsconfig.build.json", '{"extends":"./tsconfig.json","compilerOptions":{"noEmit":false}}\n'),
  ("frontend/tsconfig.node.json",  '{"compilerOptions":{"target":"ES2022","module":"ESNext"}}\n'),
  ("frontend/vite.config.ts", "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nexport default defineConfig({ plugins: [react()], server: { port: 3000 } })\n"),
  ("frontend/biome.json", '{"$schema":"https://biomejs.dev/schemas/1.6.1/schema.json","linter":{"enabled":true,"rules":{"recommended":true}},"formatter":{"enabled":true,"indentStyle":"space","indentWidth":2}}\n'),
  ("frontend/postcss.config.js", "export default { plugins: {} }\n"),
  ("frontend/playwright.config.ts", "import { defineConfig } from '@playwright/test'\nexport default defineConfig({ testDir: './tests', use: { baseURL: 'http://localhost:3000' } })\n"),
  ("frontend/openapi-ts.config.ts", "import { defineConfig } from '@hey-api/openapi-ts'\nexport default defineConfig({ client: '@hey-api/client-axios', input: 'http://localhost/openapi.json', output: 'src/client' })\n"),
  ("frontend/public/robots.txt", "User-agent: *\nDisallow: /api/\n"),
  ("frontend/public/favicon.ico", ""),
  ("frontend/src/vite-env.d.ts", '/// <reference types="vite/client" />\n'),
  ("frontend/src/routeTree.gen.ts", "// TanStack Router otomatik üretir\n"),
  ("frontend/src/main.tsx", "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App'\nReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)\n"),
  ("frontend/src/App.tsx", "// TODO: WEB-001\nexport default function App() { return <div>AIDEP</div> }\n"),
  ("frontend/src/assets/.gitkeep", ""),
  ("frontend/src/components/ui/.gitkeep", ""),
] + [
  (f"frontend/src/pages/{p}.tsx",
   f"// TODO: {i}\nexport default function {n}() {{ return <div>{n}</div> }}\n")
  for p,n,i in [
    ("LoginPage","LoginPage","WEB-004"),
    ("DashboardPage","DashboardPage","WEB-005,WEB-006"),
    ("MapPage","MapPage","WEB-008,WEB-009"),
    ("RequestsPage","RequestsPage","WEB-011"),
    ("VolunteersPage","VolunteersPage","WEB-012"),
    ("ExercisesPage","ExercisesPage","WEB-013,WEB-014"),
    ("ReportsPage","ReportsPage","WEB-017"),
  ]
] + [
  ("frontend/src/components/layout/MainLayout.tsx","// TODO: WEB-003\nexport default function MainLayout() { return <div /> }\n"),
  ("frontend/src/components/layout/Sidebar.tsx",   "// TODO: WEB-003\nexport default function Sidebar() { return <nav /> }\n"),
  ("frontend/src/components/layout/TopBar.tsx",    "// TODO: WEB-003\nexport default function TopBar() { return <header /> }\n"),
  ("frontend/src/components/map/MapContainer.tsx", "// TODO: WEB-008\nexport default function MapContainer() { return <div /> }\n"),
  ("frontend/src/components/map/DamageLayer.tsx",  "// TODO: WEB-009\nexport default function DamageLayer() { return null }\n"),
  ("frontend/src/components/map/VolunteerLayer.tsx","// TODO: WEB-009\nexport default function VolunteerLayer() { return null }\n"),
  ("frontend/src/components/map/RouteLayer.tsx",   "// TODO: WEB-009\nexport default function RouteLayer() { return null }\n"),
  ("frontend/src/components/dashboard/MetricCard.tsx","// TODO: WEB-005\nexport default function MetricCard() { return <div /> }\n"),
  ("frontend/src/components/dashboard/AlertList.tsx", "// TODO: WEB-005\nexport default function AlertList() { return <ul /> }\n"),
  ("frontend/src/hooks/useAuth.ts",       "// TODO: WEB-002\n"),
  ("frontend/src/hooks/useWebSocket.ts",  "// TODO: WEB-007\n"),
  ("frontend/src/hooks/useMap.ts",        "// TODO: WEB-008\n"),
  ("frontend/src/stores/auth.store.ts",   "// TODO: WEB-002\nimport { create } from 'zustand'\nexport const useAuthStore = create(() => ({}))\n"),
  ("frontend/src/stores/map.store.ts",    "// TODO: WEB-009\nimport { create } from 'zustand'\nexport const useMapStore = create(() => ({}))\n"),
  ("frontend/src/stores/dashboard.store.ts","// TODO: WEB-005\nimport { create } from 'zustand'\nexport const useDashboardStore = create(() => ({}))\n"),
  ("frontend/src/client/.gitkeep", ""),
  ("frontend/src/core/axios.ts",     "// TODO: WEB-002\n"),
  ("frontend/src/core/firebase.ts",  "// TODO: WEB-004\n"),
  ("frontend/src/core/websocket.ts", "// TODO: WEB-007\n"),
  ("frontend/src/core/theme.ts",     "// Tema\n"),
  ("frontend/src/types/index.ts",    "// TypeScript tipleri\n"),
  ("frontend/src/utils/geo.ts",      "// Koordinat yardımcıları\n"),
  ("frontend/src/utils/format.ts",   "// Formatlama\n"),
  ("frontend/tests/auth.spec.ts",    "// TODO: WEB-004\n"),
  ("frontend/tests/dashboard.spec.ts","// TODO: WEB-005\n"),
  ("frontend/tests/map.spec.ts",     "// TODO: WEB-009\n"),

  # ══════════════════════════════════════════════════════════════
  #  MOBILE (Expo + React Native)
  # ══════════════════════════════════════════════════════════════
  ("mobile/README.md", "# Mobile\nExpo + React Native + TypeScript\n"),
  ("mobile/.gitignore", "node_modules\n.expo\nandroid\nios\n"),
  ("mobile/app.json", '{"expo":{"name":"AIDEP","slug":"aidep-mobile","version":"1.0.0","scheme":"aidep","plugins":["expo-location","expo-image-picker"]}}\n'),
  ("mobile/App.tsx", "export { default } from './src/core/navigation/RootNavigator'\n"),
  ("mobile/App.test.tsx", ""),
  ("mobile/babel.config.js", "module.exports = { presets: ['babel-preset-expo'] }\n"),
  ("mobile/metro.config.js", "const { getDefaultConfig } = require('expo/metro-config')\nmodule.exports = getDefaultConfig(__dirname)\n"),
  ("mobile/tsconfig.json", '{"extends":"expo/tsconfig.base","compilerOptions":{"strict":true,"baseUrl":".","paths":{"@features/*":["src/features/*"],"@shared/*":["src/shared/*"],"@core/*":["src/core/*"]}}}\n'),
  ("mobile/eas.json", '{"build":{"development":{"developmentClient":true},"production":{}}}\n'),
  ("mobile/package.json", '{"name":"aidep-mobile","version":"1.0.0","main":"App.tsx","scripts":{"start":"expo start","android":"expo start --android","ios":"expo start --ios","test":"jest"}}\n'),
  ("mobile/android/.gitkeep", ""),
  ("mobile/docs/SETUP.md", "# Mobil Kurulum\n"),
] + [
  (f"mobile/src/features/{feat}/screens/{scr}.tsx",
   f"// TODO: MOB-{iss}\nimport React from 'react'\nimport {{ View, Text }} from 'react-native'\nexport default function {scr}() {{ return <View><Text>{scr}</Text></View> }}\n")
  for feat,scr,iss in [
    ("auth","LoginScreen","007"),("auth","RegisterScreen","008"),
    ("map","MapScreen","013"),("report","ReportScreen","012"),
    ("tasks","TasksScreen","018"),("navigation","NavigationScreen","017"),
    ("profile","ProfileScreen","019"),
  ]
] + [
  (f"mobile/src/features/{f}/{t}/{n}", f"// TODO: MOB-{i}\n")
  for f,t,n,i in [
    ("auth","hooks","useAuth.ts","007"),
    ("auth","services","auth.service.ts","006"),
    ("auth","types","index.ts","006"),
    ("map","hooks","useMap.ts","013"),
    ("map","components","DamageMarker.tsx","014"),
    ("map","components","RouteOverlay.tsx","016"),
    ("map","types","index.ts","013"),
    ("report","hooks","useReport.ts","012"),
    ("report","services","report.service.ts","012"),
    ("report","components","PhotoPicker.tsx","009"),
    ("tasks","hooks","useTasks.ts","018"),
    ("tasks","services","tasks.service.ts","018"),
    ("tasks","components","TaskCard.tsx","018"),
    ("navigation","hooks","useNavigation.ts","017"),
    ("navigation","components","RouteInfo.tsx","017"),
    ("profile","hooks","useProfile.ts","019"),
  ]
] + [
  ("mobile/src/shared/components/Button.tsx",       ""),
  ("mobile/src/shared/components/Input.tsx",        ""),
  ("mobile/src/shared/components/Card.tsx",         ""),
  ("mobile/src/shared/components/LoadingOverlay.tsx",""),
  ("mobile/src/shared/components/OfflineBanner.tsx","// Çevrimdışı banner — Issue MOB-020\n"),
  ("mobile/src/shared/hooks/usePermissions.ts",     "// Kamera + Konum izin — Issue MOB-009, MOB-011\n"),
  ("mobile/src/shared/hooks/useLocation.ts",        "// GPS — Issue MOB-011\n"),
  ("mobile/src/shared/utils/format.ts",             ""),
  ("mobile/src/shared/utils/geo.ts",                ""),
  ("mobile/src/shared/types/index.ts",              ""),
  ("mobile/src/core/api/axiosInstance.ts",          "// Axios + JWT — Issue MOB-003\n"),
  ("mobile/src/core/api/endpoints.ts",              ""),
  ("mobile/src/core/firebase/index.ts",             "// Firebase — Issue MOB-006\n"),
  ("mobile/src/core/navigation/RootNavigator.tsx",  "// Auth/App stack — Issue MOB-005\n"),
  ("mobile/src/core/navigation/AppNavigator.tsx",   "// BottomTab — Issue MOB-005\n"),
  ("mobile/src/core/navigation/AuthNavigator.tsx",  "// Auth stack — Issue MOB-005\n"),
  ("mobile/src/core/stores/auth.store.ts",          "// Zustand auth — Issue MOB-004\n"),
  ("mobile/src/core/stores/map.store.ts",           "// Zustand harita — Issue MOB-004\n"),
  ("mobile/src/core/stores/offline.store.ts",       "// Offline kuyruk — Issue MOB-020\n"),
  ("mobile/src/core/stores/tasks.store.ts",         "// Görev store — Issue MOB-004\n"),
  ("mobile/src/core/offline/offlineQueue.ts",       "// AsyncStorage FIFO kuyruk — Issue MOB-020\n"),
  ("mobile/src/core/websocket/wsClient.ts",         "// WebSocket istemcisi — Issue MOB-015\n"),
]


def build(root, files):
    n = 0
    for path, content in files:
        abs_path = os.path.join(root, path)
        os.makedirs(os.path.dirname(abs_path) or ".", exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        n += 1
    return n


if __name__ == "__main__":
    print(f"\n  AIDEP şablonu oluşturuluyor: {ROOT}/\n")
    n = build(ROOT, FILES)
    print(f"  {n} dosya oluşturuldu.\n")
    print("  AI kısmı özeti:")
    print("  ├── ai-service/                YOLOv8m + XGBoost (Docker, Port 8001)")
    print("  │   ├── app/models/            YOLOv8m wrapper + XGBoost wrapper")
    print("  │   ├── app/routers/           /detect + /prioritize endpoint'leri")
    print("  │   └── training/              train_yolo.py + train_xgboost.py")
    print("  └── backend/app/logic/         Enhanced Greedy + Risk Skoru (backend'de)")
    print("      ├── greedy_algorithm.py    O(n log n), %95-98 optimal")
    print("      └── risk_scoring.py        Rota güvenlik skoru")
    print()
    print("  Sonraki adımlar:")
    print(f"    cd {ROOT}")
    print("    cp docker/.env.dev.example docker/.env.dev")
    print("    # Şifreleri doldurun")
    print("    make dev")
    print()
