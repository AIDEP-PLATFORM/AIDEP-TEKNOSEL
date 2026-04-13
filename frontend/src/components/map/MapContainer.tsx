import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { DamageReport, RouteAlternative, Team, Volunteer } from "../../types/api";

/* ── Leaflet default icon fix ──────────────────────────────────────────── */
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ── Sabitler — yalnızca Türkiye ana kara (+ adalar) görünümü ─────────── */

/** Yaklaşık ülke sınırı (SW → NE); kaydırma bu kutunun dışına çıkamaz */
const TURKEY_BOUNDS = L.latLngBounds(
  [35.65, 25.2] as L.LatLngTuple,
  [42.45, 45.05] as L.LatLngTuple,
);

const DEFAULT_CENTER: L.LatLngExpression = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

/* ── Renk yardımcıları ───────────────────────────────────────────────── */

const SEV_COLOR: Record<number, string> = {
  1: "#22c55e",
  2: "#86efac",
  3: "#fbbf24",
  4: "#f97316",
  5: "#ef4444",
};

function severityColor(s: number | null) {
  return SEV_COLOR[s ?? 3] ?? "#f97316";
}

function riskColor(score: number | null) {
  if (score == null) return "#3b82f6";
  if (score >= 7) return "#ef4444";
  if (score >= 4) return "#f59e0b";
  return "#22c55e";
}

/* ── İkonlar ─────────────────────────────────────────────────────────── */

function damageIcon(severity: number | null, isNew = false) {
  const color = severityColor(severity);
  const pulse = isNew
    ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:${color};opacity:0.3;animation:mapPulse 1.4s ease-out infinite;"></div>`
    : "";
  return L.divIcon({
    html: `<div style="position:relative;width:28px;height:36px">
      ${pulse}
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.75 14 22 14 22S28 23.75 28 14C28 6.27 21.73 0 14 0z" fill="${color}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
        <circle cx="14" cy="14" r="5" fill="#fff" fill-opacity="0.9"/>
      </svg>
    </div>`,
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

function teamIcon(status: string) {
  const color =
    status === "available"
      ? "#3b82f6"
      : status === "on_mission"
        ? "#f59e0b"
        : "#64748b";
  return L.divIcon({
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
      <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
        <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/>
        <path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>
      </svg>
    </div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

function volunteerIcon(isAvailable: boolean) {
  const color = isAvailable ? "#10b981" : "#94a3b8";
  return L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.3);"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

function endpointIcon(label: "A" | "B", color: string) {
  return L.divIcon({
    html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.35);font-family:system-ui">${label}</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -18],
  });
}

/* ── Popup HTML ──────────────────────────────────────────────────────── */

function buildDamagePopup(r: DamageReport, canRoute: boolean) {
  const date = new Date(r.created_at).toLocaleString("tr-TR");
  const sColor = severityColor(r.severity);
  return `<div style="min-width:200px;font-family:system-ui,sans-serif;font-size:13px;color:#1e293b;line-height:1.5">
    <b style="color:${sColor};font-size:14px">${r.damage_class ?? "Hasar Raporu"}</b>
    <div style="margin:5px 0;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      ${r.severity != null ? `<span style="background:${sColor};color:#000;border-radius:4px;padding:1px 8px;font-weight:700;font-size:11px">Şiddet ${r.severity}</span>` : ""}
      <span style="background:#f1f5f9;border-radius:4px;padding:1px 8px;font-size:11px;color:#475569">${r.status}</span>
    </div>
    <div style="color:#94a3b8;font-size:11px;margin-bottom:6px">${date}</div>
    ${r.description ? `<div style="color:#475569;font-size:12px;border-top:1px solid #e2e8f0;padding-top:5px;margin-bottom:6px">${r.description}</div>` : ""}
    ${
      canRoute
        ? `<button data-damage-id="${r.id}" data-lat="${r.lat}" data-lng="${r.lng}" data-label="${(r.damage_class ?? "Hasar") + " – Şiddet " + (r.severity ?? "?")}"
      onclick="window.__aidepRouteRequest(this)"
      style="width:100%;padding:7px 0;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
      <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='3' cy='12' r='1'/><circle cx='12' cy='5' r='1'/><circle cx='21' cy='12' r='1'/><line x1='3' y1='12' x2='12' y2='5'/><line x1='12' y1='5' x2='21' y2='12'/></svg>
      Ekibe Yönlendir
    </button>`
        : ""
    }
  </div>`;
}

/* ── Tipler ──────────────────────────────────────────────────────────── */

export interface RouteResult {
  /** Backend/OSRM'den gelen GeoJSON koordinatları: [[lng, lat], ...] */
  coordinates: number[][];
  distanceMeters: number | null;
  durationSeconds: number | null;
  riskScore: number | null;
  startLabel?: string;
  endLabel?: string;
  /** Tüm alternatif rotalar (risk sıralı); yoksa sadece ana rota gösterilir */
  alternatives?: RouteAlternative[];
  /** Seçili alternatif indeksi (varsayılan: 0) */
  selectedAltIndex?: number;
}

export interface RouteRequest {
  damageId: string;
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  reports: DamageReport[];
  teams?: Team[];
  volunteers?: Volunteer[];
  route?: RouteResult | null;
  liveReport?: DamageReport | null;
  clickMode?: "start" | "end" | null;
  onPointPicked?: (lat: number, lng: number, which: "start" | "end") => void;
  onRouteRequest?: (req: RouteRequest) => void;
}

/* ── Bileşen ─────────────────────────────────────────────────────────── */

export default function MapContainer({
  reports,
  teams = [],
  volunteers = [],
  route,
  liveReport,
  clickMode,
  onPointPicked,
  onRouteRequest,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const damageLayerRef = useRef<L.LayerGroup | null>(null);
  const teamLayerRef = useRef<L.LayerGroup | null>(null);
  const volunteerLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const liveLayerRef = useRef<L.LayerGroup | null>(null);
  const initialFitDone = useRef(false);
  const clickModeRef = useRef(clickMode);
  const onRouteRef = useRef(onRouteRequest);
  const onPointPickedRef = useRef(onPointPicked);

  useEffect(() => {
    clickModeRef.current = clickMode;
  }, [clickMode]);
  useEffect(() => {
    onRouteRef.current = onRouteRequest;
  }, [onRouteRequest]);
  useEffect(() => {
    onPointPickedRef.current = onPointPicked;
  }, [onPointPicked]);

  /* ── Haritayı bir kez başlat ─────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      maxBounds: TURKEY_BOUNDS,
      maxBoundsViscosity: 1,
      minZoom: 5,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    // Zoom kontrolünü sağ alta al (panel ile çakışmasın diye)
    L.control.zoom({ position: "bottomright" }).addTo(map);

    damageLayerRef.current = L.layerGroup().addTo(map);
    teamLayerRef.current = L.layerGroup().addTo(map);
    volunteerLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    liveLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    /* Global popup callback */
    (window as unknown as Record<string, unknown>).__aidepRouteRequest = (
      btn: HTMLButtonElement,
    ) => {
      const id = btn.getAttribute("data-damage-id") ?? "";
      const lat = Number(btn.getAttribute("data-lat"));
      const lng = Number(btn.getAttribute("data-lng"));
      const label = btn.getAttribute("data-label") ?? "Hasar Noktası";
      onRouteRef.current?.({ damageId: id, lat, lng, label });
      map.closePopup();
    };

    map.on("click", (e: L.LeafletMouseEvent) => {
      const mode = clickModeRef.current;
      if (!mode) return;
      onPointPickedRef.current?.(e.latlng.lat, e.latlng.lng, mode);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      damageLayerRef.current = null;
      teamLayerRef.current = null;
      volunteerLayerRef.current = null;
      routeLayerRef.current = null;
      liveLayerRef.current = null;
      initialFitDone.current = false;
    };
  }, []); // sadece mount/unmount

  /* ── Cursor ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current) return;
    const container = mapRef.current.getContainer();
    container.style.cursor = clickMode ? "crosshair" : "";
  }, [clickMode]);

  /* ── Hasar marker'ları ───────────────────────────────────────────── */
  useEffect(() => {
    const layer = damageLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const valid = reports.filter((r) => r.lat != null && r.lng != null);
    for (const r of valid) {
      L.marker([r.lat as number, r.lng as number], {
        icon: damageIcon(r.severity),
      })
        .bindPopup(buildDamagePopup(r, !!onRouteRequest), { maxWidth: 240 })
        .addTo(layer);
    }
    if (!initialFitDone.current && valid.length > 0 && mapRef.current) {
      initialFitDone.current = true;
      const markerBounds = L.latLngBounds(
        valid.map((r) => [r.lat as number, r.lng as number]),
      );
      mapRef.current.fitBounds(markerBounds, {
        padding: [60, 60],
        maxZoom: 13,
      });
      mapRef.current.panInsideBounds(TURKEY_BOUNDS, { animate: false });
    }
  }, [reports, onRouteRequest]);

  /* ── Ekip marker'ları ────────────────────────────────────────────── */
  useEffect(() => {
    const layer = teamLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const t of teams.filter((t) => t.lat != null && t.lng != null)) {
      const statusTr =
        t.status === "available"
          ? "Müsait"
          : t.status === "on_mission"
            ? "Görevde"
            : "Pasif";
      const badgeBg =
        t.status === "available"
          ? "#dcfce7"
          : t.status === "on_mission"
            ? "#fef9c3"
            : "#f1f5f9";
      const badgeColor =
        t.status === "available"
          ? "#166534"
          : t.status === "on_mission"
            ? "#854d0e"
            : "#475569";
      L.marker([t.lat as number, t.lng as number], { icon: teamIcon(t.status) })
        .bindPopup(`<div style="font-family:system-ui;font-size:13px;min-width:160px">
          <b style="font-size:14px">${t.name}</b><br/>
          <span style="color:#64748b;font-size:12px">${t.organization}</span>
          <div style="margin-top:6px;display:flex;gap:6px;align-items:center">
            <span style="background:${badgeBg};color:${badgeColor};border-radius:4px;padding:1px 8px;font-size:11px;font-weight:700">${statusTr}</span>
            <span style="font-size:11px;color:#94a3b8">${t.member_count ?? 0}/${t.max_size} üye</span>
          </div>
        </div>`)
        .addTo(layer);
    }
  }, [teams]);

  /* ── Gönüllü marker'ları ─────────────────────────────────────────── */
  useEffect(() => {
    const layer = volunteerLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const v of volunteers.filter((v) => v.lat != null && v.lng != null)) {
      L.marker([v.lat as number, v.lng as number], {
        icon: volunteerIcon(v.is_available),
      })
        .bindPopup(`<div style="font-family:system-ui;font-size:12px;min-width:130px">
          <b>Gönüllü</b>
          <div style="color:#64748b;margin-top:4px">
            ${v.is_available ? "Müsait" : "Müsait değil"}
            ${v.skills.length ? `<br/>${v.skills.join(", ")}` : ""}
          </div>
        </div>`)
        .addTo(layer);
    }
  }, [volunteers]);

  /* ── Canlı hasar (WebSocket) ─────────────────────────────────────── */
  useEffect(() => {
    const layer = liveLayerRef.current;
    if (
      !layer ||
      !liveReport ||
      liveReport.lat == null ||
      liveReport.lng == null
    )
      return;
    layer.clearLayers();
    const m = L.marker([liveReport.lat, liveReport.lng], {
      icon: damageIcon(liveReport.severity, true),
      zIndexOffset: 1000,
    })
      .bindPopup(buildDamagePopup(liveReport, !!onRouteRequest))
      .addTo(layer);
    m.openPopup();
    mapRef.current?.setView(
      [liveReport.lat, liveReport.lng],
      Math.max(mapRef.current.getZoom(), 13),
      { animate: true },
    );
    const t = setTimeout(() => layer.clearLayers(), 8000);
    return () => clearTimeout(t);
  }, [liveReport, onRouteRequest]);

  /* ── Rota polyline (ana + alternatifler) ─────────────────────────── */
  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!route?.coordinates?.length) return;

    const selIdx = route.selectedAltIndex ?? 0;
    const alts = route.alternatives ?? [];

    /*
     * Backend OSRM GeoJSON formatı: coordinates = [[lng, lat], ...]
     * Leaflet formatı: [lat, lng]
     */
    const toLatLngs = (coords: number[][]): L.LatLngExpression[] =>
      coords.map(([lng, lat]) => [lat, lng] as L.LatLngExpression);

    // Önce alternatif (soluk) rotaları çiz
    alts.forEach((alt, i) => {
      if (i === selIdx || !alt.coordinates?.length) return;
      const ll = toLatLngs(alt.coordinates);
      L.polyline(ll, {
        color: "rgba(148,163,184,0.25)",
        weight: 7,
        opacity: 1,
      }).addTo(layer);
      L.polyline(ll, {
        color: "#94a3b8",
        weight: 4,
        opacity: 0.5,
        dashArray: "8 5",
      }).addTo(layer);
    });

    // Seçili rotanın koordinatları
    const activeCoords =
      alts.length > 0 && alts[selIdx]
        ? alts[selIdx].coordinates
        : route.coordinates;
    const activeRisk =
      alts.length > 0 && alts[selIdx] ? alts[selIdx].risk_score : route.riskScore;

    const latlngs = toLatLngs(activeCoords);
    const color = riskColor(activeRisk ?? null);

    // Gölge + ana rota
    L.polyline(latlngs, { color: "rgba(0,0,0,0.25)", weight: 9, opacity: 1 }).addTo(layer);
    L.polyline(latlngs, { color, weight: 6, opacity: 0.92 }).addTo(layer);

    const first = latlngs[0];
    const last = latlngs[latlngs.length - 1];

    const riskLabel =
      activeRisk == null
        ? ""
        : activeRisk >= 7
          ? "⚠️ Yüksek Risk"
          : activeRisk >= 4
            ? "Orta Risk"
            : "Güvenli Rota";

    L.marker(first, { icon: endpointIcon("A", "#3b82f6"), zIndexOffset: 500 })
      .bindPopup(
        `<b>Başlangıç</b>${route.startLabel ? `<br/><span style="color:#64748b;font-size:12px">${route.startLabel}</span>` : ""}`,
      )
      .addTo(layer);

    L.marker(last, { icon: endpointIcon("B", color), zIndexOffset: 500 })
      .bindPopup(
        `<b>Varış</b>${route.endLabel ? `<br/><span style="color:#64748b;font-size:12px">${route.endLabel}</span>` : ""}${riskLabel ? `<br/><span style="color:${color};font-weight:700;font-size:12px">${riskLabel}</span>` : ""}`,
      )
      .addTo(layer);

    const map = mapRef.current;
    if (map) {
      map.fitBounds(L.latLngBounds(latlngs), { padding: [80, 80] });
      map.panInsideBounds(TURKEY_BOUNDS, { animate: false });
    }
  }, [route]);

  return (
    <>
      <style>{`
        @keyframes mapPulse {
          0%   { transform: scale(1);   opacity: 0.35; }
          70%  { transform: scale(3);   opacity: 0; }
          100% { transform: scale(1);   opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
        }
      `}</style>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
      />
    </>
  );
}
