# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. ÖNCE sadece bağımlılık dosyasını kopyala (bu katman cache'lenir)
#    pyproject.toml değişmediği sürece pip tekrar çalışmaz.
COPY pyproject.toml README.md ./

# Stub package → setuptools projeyi resolve edebilsin
RUN mkdir -p app && touch app/__init__.py

# 2. Bağımlılıkları kur (kaynak kod kopyalanmadan ÖNCE — kritik!)
RUN pip install --no-cache-dir setuptools wheel
RUN pip wheel --no-cache-dir --wheel-dir /tmp/wheels ".[dev]" 2>/dev/null || \
    pip wheel --no-cache-dir --wheel-dir /tmp/wheels .

# 3. SONRA kaynak kodu kopyala (bu katman sık değişir ama pip tekrar çalışmaz)
COPY . .

# Projenin kendi wheel'ini build et
RUN pip wheel --no-cache-dir --wheel-dir /tmp/wheels --no-deps .

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev libglib2.0-0 curl \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system aidep && adduser --system --ingroup aidep aidep

WORKDIR /app

# Wheel'leri kopyala ve kur (internet erişimi yok, hızlı)
COPY --from=builder /tmp/wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
    && pip install --no-cache-dir "pytest>=8.0.0" "pytest-asyncio>=0.24.0"

# Kaynak kodu kopyala
COPY --from=builder /app /app

RUN chown -R aidep:aidep /app
USER aidep

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
