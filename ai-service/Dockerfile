FROM python:3.11-slim
RUN apt-get update && apt-get install -y libgl1 libsm6 libxext6 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir ultralytics==8.1.0 xgboost==2.0.3 fastapi uvicorn pillow numpy opencv-python-headless
WORKDIR /app
COPY . .
EXPOSE 8001
# `app` klasöründe olduğu için app.main kullanıldı
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
