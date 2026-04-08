"""
YOLOv8m Fine-Tuning — Issue AI-005
=====================================
Rapor §3.3:
  Base model: yolov8m.pt (COCO pretrained, transfer learning)
  Veri bölme:  Train %60 / Val %20 / Test %20
  Hedef:       mAP@50 ≥ 0.85
  Augmentation: flip, brightness±20%, Gaussian noise, rotate±15°, mosaic
"""
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
