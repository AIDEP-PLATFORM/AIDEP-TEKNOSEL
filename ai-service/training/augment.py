"""
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
"""
