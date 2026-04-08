param(
    [string]$Url = "http://download.geofabrik.de/europe/turkey-latest.osm.pbf"
)

$FileName = Split-Path $Url -Leaf
$DataDir = Join-Path (Get-Location) "osrm-data"

Write-Host "[1/4] OSRM veri klasörü hazırlanıyor: $DataDir"
if (-Not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}

$FilePath = Join-Path $DataDir $FileName
if (-Not (Test-Path $FilePath)) {
    Write-Host "[2/4] Harita verisi indiriliyor: $Url"
    Invoke-WebRequest -Uri $Url -OutFile $FilePath
} else {
    Write-Host "[2/4] Harita verisi zaten mevcut, indirme atlanıyor."
}

Write-Host "[3/4] OSRM için rota verisi çıkartılıyor (extract)..."
docker run -t -v "${DataDir}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua "/data/$FileName"

Write-Host "[4/4] OSRM için rota verisi bölümleniyor ve özelleştiriliyor..."
docker run -t -v "${DataDir}:/data" osrm/osrm-backend osrm-partition "/data/$FileName"
docker run -t -v "${DataDir}:/data" osrm/osrm-backend osrm-customize "/data/$FileName"

Write-Host "OSRM verisi hazır! Artık 'docker compose up' diyerek OSRM servisini başlatabilirsiniz."
