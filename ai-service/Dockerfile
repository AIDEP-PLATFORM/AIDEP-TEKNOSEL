FROM python:3.11-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libgl1 libsm6 libxext6 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir \
        "ultralytics>=8.3.0" \
        "xgboost==2.0.3" \
        "fastapi>=0.110.0" \
        "uvicorn[standard]>=0.27.1" \
        "pillow>=10.2.0" \
        "numpy>=1.26.4" \
        "opencv-python-headless>=4.9.0.80" \
        "joblib>=1.3.2"

FROM python:3.11-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libsm6 libxext6 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
RUN addgroup --system aidep && adduser --system --ingroup aidep --home /home/aidep aidep
RUN mkdir -p /home/aidep && chown aidep:aidep /home/aidep
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV HOME="/home/aidep"
ENV MPLCONFIGDIR="/tmp/matplotlib"
ENV YOLO_CONFIG_DIR="/tmp/ultralytics"
WORKDIR /app
COPY . .
RUN chown -R aidep:aidep /app
USER aidep
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
