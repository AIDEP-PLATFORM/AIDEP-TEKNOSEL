#!/bin/bash
URL=${1:-"http://download.geofabrik.de/europe/turkey-latest.osm.pbf"}
FILENAME=$(basename "$URL")
DATA_DIR="$(pwd)/osrm-data"

echo "[1/4] OSRM veri klasörü hazırlanıyor: $DATA_DIR"
mkdir -p "$DATA_DIR"

if [ ! -f "$DATA_DIR/$FILENAME" ]; then
    echo "[2/4] Harita verisi indiriliyor: $URL"
    curl -L "$URL" -o "$DATA_DIR/$FILENAME"
else
    echo "[2/4] Harita verisi zaten mevcut."
fi

echo "[3/4] OSRM için rota verisi çıkartılıyor (extract)..."
docker run -t -v "$DATA_DIR:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua "/data/$FILENAME"

echo "[4/4] OSRM için rota verisi bölümleniyor ve özelleştiriliyor..."
docker run -t -v "$DATA_DIR:/data" osrm/osrm-backend osrm-partition "/data/$FILENAME"
docker run -t -v "$DATA_DIR:/data" osrm/osrm-backend osrm-customize "/data/$FILENAME"

echo "OSRM verisi hazır!"
