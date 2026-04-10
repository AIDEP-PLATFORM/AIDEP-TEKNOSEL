FROM python:3.11-slim as builder
RUN apt-get update && apt-get install -y gcc libpq-dev libglib2.0-0 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir setuptools wheel
RUN pip wheel --no-cache-dir --wheel-dir /tmp/wheels .

FROM python:3.11-slim as runtime
RUN apt-get update && apt-get install -y libpq-dev libglib2.0-0 && rm -rf /var/lib/apt/lists/*
RUN addgroup --system aidep && adduser --system --ingroup aidep aidep
WORKDIR /app
COPY --from=builder /tmp/wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/*
COPY . .
RUN chown -R aidep:aidep /app
USER aidep
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
