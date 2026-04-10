import os
YOLO_PATH    = os.getenv("YOLO_MODEL_PATH",    "/models/yolov8s_aidep.pt")
XGBOOST_PATH = os.getenv("XGBOOST_MODEL_PATH", "/models/xgboost_priority.pkl")
MINIO_ENDPOINT   = os.getenv("MINIO_ENDPOINT",   "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
