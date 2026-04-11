# ── Stage 1: Builder — bağımlılıklar (ağır katman, iyi cache'lenir) ───────────
FROM python:3.11-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libgl1 libsm6 libxext6 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# ── Ağır bağımlılıklar AYRI RUN katmanında ─────────────────────────────
# ultralytics içinde PyTorch var (~2-3 GB). Bu katman sadece versiyon
# değiştiğinde yeniden indirilir — kaynak kodu değişince ÇALIŞMAZ.
RUN pip install --no-cache-dir \
    "ultralytics>=8.3.0" \
    "xgboost==2.0.3" \
    "opencv-python-headless>=4.9.0.80"

# ── Hafif bağımlılıklar ayrı katmanda ──────────────────────────────────
RUN pip install --no-cache-dir \
    "fastapi>=0.110.0" \
    "uvicorn[standard]>=0.27.1" \
    "pillow>=10.2.0" \
    "numpy>=1.26.4" \
    "joblib>=1.3.2" \
    "minio>=7.2.5"

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libsm6 libxext6 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system aidep && \
    adduser --system --ingroup aidep --home /home/aidep aidep && \
    mkdir -p /home/aidep && chown aidep:aidep /home/aidep

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV HOME="/home/aidep"
ENV MPLCONFIGDIR="/tmp/matplotlib"
ENV YOLO_CONFIG_DIR="/tmp/ultralytics"

WORKDIR /app

# Kaynak kodu en sona kopyala (bağımlılık cache'ini bozmaz)
COPY . .
RUN chown -R aidep:aidep /app

USER aidep
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
