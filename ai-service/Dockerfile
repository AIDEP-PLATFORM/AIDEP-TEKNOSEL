FROM python:3.11-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libgl1 libsm6 libxext6 \
    && rm -rf /var/lib/apt/lists/*
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir \
        ultralytics==8.1.0 xgboost==2.0.3 fastapi uvicorn pillow numpy opencv-python-headless

FROM python:3.11-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libsm6 libxext6 \
    && rm -rf /var/lib/apt/lists/*
RUN addgroup --system aidep && adduser --system --ingroup aidep aidep
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
WORKDIR /app
COPY . .
RUN chown -R aidep:aidep /app
USER aidep
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
