"""
Model Değerlendirme — Issue AI-006
====================================
Rapor §3.3 metrikleri:
  YOLOv8s: Confusion matrix, Precision, Recall, F1, mAP@50, ROC-AUC
  XGBoost: R², MAE, 5-katlı CV, SHAP değerleri
"""
from ultralytics import YOLO

def evaluate_yolo(model_path="../ml_models/yolov8s_aidep.pt",
                  data_yaml="../ml_models/data.yaml"):
    model = YOLO(model_path)
    m = model.val(data=data_yaml, split="test")
    print(f"mAP@50:    {m.box.map50:.4f}  (Hedef: ≥ 0.85)")
    print(f"mAP@50-95: {m.box.map:.4f}")
    print(f"Precision: {m.box.mp:.4f}")
    print(f"Recall:    {m.box.mr:.4f}")
    return m

if __name__ == "__main__":
    evaluate_yolo()
