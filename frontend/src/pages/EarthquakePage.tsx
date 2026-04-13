import { Box, Flex, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Waves,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import MapContainer from "../components/map/MapContainer";
import StkGlassCard from "../components/stk/StkGlassCard";
import StkPageShell from "../components/stk/StkPageShell";
import earthquakeService, { type EarthquakeItem } from "../services/earthquake.service";
import type { DamageReport } from "../types/api";

/* ── Sabitler ────────────────────────────────────────────────────────── */

const EQ_WS_URL = (import.meta.env.VITE_WS_URL || "ws://localhost/ws") + "/earthquakes";

function magColor(m: number): string {
  if (m >= 6) return "#ef4444";
  if (m >= 5) return "#f97316";
  if (m >= 4) return "#f59e0b";
  if (m >= 3) return "#eab308";
  return "#22c55e";
}

function magLabel(m: number): string {
  if (m >= 6) return "Güçlü";
  if (m >= 5) return "Orta Güçlü";
  if (m >= 4) return "Orta";
  if (m >= 3) return "Hafif";
  return "Mikro";
}

function timeSince(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)} sn önce`;
  if (diff < 3600) return `${Math.round(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.round(diff / 3600)} sa önce`;
  return `${Math.round(diff / 86400)} gün önce`;
}

/* ── EQ item → DamageReport-benzeri (haritaya göndermek için) ─────── */
function eqToMapItem(eq: EarthquakeItem): DamageReport {
  return {
    id: eq.id,
    user_id: "",
    description: `M${eq.magnitude.toFixed(1)} — ${eq.location_name}`,
    photo_url: "",
    damage_class: `Deprem M${eq.magnitude.toFixed(1)}`,
    severity: eq.magnitude >= 6 ? 5 : eq.magnitude >= 5 ? 4 : eq.magnitude >= 4 ? 3 : eq.magnitude >= 3 ? 2 : 1,
    priority_score: null,
    status: "deprem",
    lat: eq.lat,
    lng: eq.lng,
    created_at: eq.event_time,
    updated_at: null,
  };
}

/* ── Filter bar ──────────────────────────────────────────────────────── */
const MAG_FILTERS = [
  { label: "Tümü (M≥2)", value: 2 },
  { label: "M≥3", value: 3 },
  { label: "M≥4", value: 4 },
  { label: "M≥5", value: 5 },
];

const HOUR_FILTERS = [
  { label: "Son 24 saat", value: 24 },
  { label: "Son 48 saat", value: 48 },
  { label: "Son 7 gün", value: 168 },
];

/* ── Ana sayfa ────────────────────────────────────────────────────────── */

const EarthquakePage: React.FC = () => {
  const [items, setItems] = useState<EarthquakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minMag, setMinMag] = useState(2);
  const [hours, setHours] = useState(48);
  const [liveAlerts, setLiveAlerts] = useState<EarthquakeItem[]>([]);
  const [liveEq, setLiveEq] = useState<EarthquakeItem | null>(null);

  /* WS */
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await earthquakeService.fetchAll({ min_mag: minMag, hours, limit: 300 });
      setItems(res.items);
    } catch {
      setError("Deprem verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [minMag, hours]);

  useEffect(() => { void loadData(); }, [loadData]);

  /* WebSocket — gerçek zamanlı deprem alarmı */
  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(EQ_WS_URL);
    wsRef.current = ws;
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as {
          type: string;
          data: EarthquakeItem;
        };
        if (msg.type !== "new_earthquake") return;
        const eq = msg.data;
        setItems((prev) => [eq, ...prev]);
        setLiveAlerts((prev) => [eq, ...prev.slice(0, 4)]);
        setLiveEq(eq);
        setTimeout(() => setLiveEq(null), 10000);
      } catch { /* ignore */ }
    };
    ws.onclose = () => { reconnectTimer.current = setTimeout(connectWs, 5000); };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connectWs();
    return () => {
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connectWs]);

  /* İstatistikler */
  const stats = {
    total: items.length,
    mag4plus: items.filter((e) => e.magnitude >= 4).length,
    mag5plus: items.filter((e) => e.magnitude >= 5).length,
    strongest: items.reduce<EarthquakeItem | null>(
      (a, b) => (!a || b.magnitude > a.magnitude ? b : a),
      null,
    ),
  };

  const mapItems = items.map(eqToMapItem);
  const liveMapItem = liveEq ? eqToMapItem(liveEq) : null;

  return (
    <StkPageShell title="Deprem Takip">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Canlı alarmlar ── */}
      <Box position="fixed" bottom={6} right={6} zIndex={9999} display="flex" flexDirection="column" gap={2}>
        <AnimatePresence>
          {liveAlerts.map((eq) => (
            <motion.div key={eq.id + eq.event_time} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} transition={{ duration: 0.3 }}>
              <Box bg="rgba(15,23,42,0.97)" border={`1px solid ${magColor(eq.magnitude)}55`} borderRadius={10} px={4} py={3} minW="260px" boxShadow="0 8px 32px rgba(0,0,0,0.5)" display="flex" alignItems="flex-start" gap={3}>
                <Zap size={16} color={magColor(eq.magnitude)} style={{ marginTop: 2, flexShrink: 0 }} />
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="800" style={{ color: magColor(eq.magnitude) }}>
                    ⚠️ Yeni Deprem — M{eq.magnitude.toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.700" mt={0.5} lineHeight={1.5}>{eq.location_name}</Text>
                  <Text fontSize="10px" color="whiteAlpha.400" mt={0.5}>{timeSince(eq.event_time)} · {eq.source}</Text>
                </Box>
                <button type="button" onClick={() => setLiveAlerts((p) => p.filter((x) => x.id !== eq.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0 }}>
                  <X size={13} />
                </button>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* ── İstatistik kartları ── */}
      <Flex gap={3} mb={4} flexWrap="wrap">
        {[
          { label: "Toplam Deprem", value: loading ? "…" : stats.total, icon: <Activity size={16} />, color: "#3b82f6" },
          { label: "M≥4 Deprem", value: loading ? "…" : stats.mag4plus, icon: <Waves size={16} />, color: "#f59e0b" },
          { label: "M≥5 Deprem", value: loading ? "…" : stats.mag5plus, icon: <AlertTriangle size={16} />, color: "#f97316" },
          {
            label: "En Güçlü",
            value: stats.strongest ? `M${stats.strongest.magnitude.toFixed(1)}` : "—",
            icon: <Zap size={16} />,
            color: stats.strongest ? magColor(stats.strongest.magnitude) : "#64748b",
            sub: stats.strongest?.location_name.split(",")[0] ?? "",
          },
        ].map((s) => (
          <Box key={s.label} flex="1" minW="140px" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)" borderRadius={12} p={4}>
            <Flex align="center" gap={2} mb={1} style={{ color: s.color }}>
              {s.icon}
              <Text fontSize="10px" fontWeight="700" letterSpacing="wider" color="whiteAlpha.500">{s.label.toUpperCase()}</Text>
            </Flex>
            <Text fontSize="1.8rem" fontWeight="800" color="white" lineHeight={1}>{s.value}</Text>
            {s.sub && <Text fontSize="10px" color="whiteAlpha.400" mt={1} style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{s.sub}</Text>}
          </Box>
        ))}
      </Flex>

      {/* ── Filtreler ── */}
      <Flex gap={2} mb={4} flexWrap="wrap" align="center">
        <Text fontSize="xs" color="whiteAlpha.500" mr={1}>Büyüklük:</Text>
        {MAG_FILTERS.map((f) => (
          <button key={f.value} type="button" onClick={() => setMinMag(f.value)}
            style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${minMag === f.value ? "#3b82f6" : "rgba(255,255,255,0.1)"}`, background: minMag === f.value ? "rgba(59,130,246,0.15)" : "transparent", color: minMag === f.value ? "#60a5fa" : "rgba(255,255,255,0.5)", fontSize: "0.78rem", cursor: "pointer", fontWeight: minMag === f.value ? 700 : 400 }}>
            {f.label}
          </button>
        ))}
        <Box w="1px" h="16px" bg="rgba(255,255,255,0.1)" mx={1} />
        <Text fontSize="xs" color="whiteAlpha.500" mr={1}>Zaman:</Text>
        {HOUR_FILTERS.map((f) => (
          <button key={f.value} type="button" onClick={() => setHours(f.value)}
            style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${hours === f.value ? "#8b5cf6" : "rgba(255,255,255,0.1)"}`, background: hours === f.value ? "rgba(139,92,246,0.15)" : "transparent", color: hours === f.value ? "#a78bfa" : "rgba(255,255,255,0.5)", fontSize: "0.78rem", cursor: "pointer", fontWeight: hours === f.value ? 700 : 400 }}>
            {f.label}
          </button>
        ))}
        <button type="button" onClick={() => void loadData()} disabled={loading}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", cursor: "pointer" }}>
          <RefreshCw size={12} style={loading ? { animation: "spin 1s linear infinite" } : {}} />
          Yenile
        </button>
      </Flex>

      {/* ── Harita ── */}
      <StkGlassCard style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <Box h={{ base: "380px", md: "480px" }}>
          {loading ? (
            <Flex h="100%" align="center" justify="center" gap={3}>
              <Loader2 size={18} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
              <Text color="whiteAlpha.500" fontSize="sm">Deprem verileri yükleniyor…</Text>
            </Flex>
          ) : (
            <MapContainer
              reports={mapItems}
              liveReport={liveMapItem}
            />
          )}
        </Box>
      </StkGlassCard>

      {/* ── Liste ── */}
      <StkGlassCard>
        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
          <Flex align="center" gap={2}>
            <Activity size={15} color="#3b82f6" />
            <Text fontSize="sm" fontWeight="700" color="white">Deprem Listesi</Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Box w={2} h={2} borderRadius="full" bg={wsRef.current?.readyState === WebSocket.OPEN ? "#4ade80" : "#94a3b8"} />
            <Text fontSize="10px" color="whiteAlpha.400">
              {wsRef.current?.readyState === WebSocket.OPEN ? "Canlı bağlantı aktif" : "Bağlanıyor…"}
            </Text>
          </Flex>
        </Flex>

        {error && (
          <Flex align="center" gap={2} bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.25)" borderRadius={8} p={3} mb={4}>
            <AlertTriangle size={14} color="#ef4444" />
            <Text fontSize="sm" color="red.300">{error}</Text>
          </Flex>
        )}

        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", color: "rgba(255,255,255,0.88)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["#", "Büyüklük", "Konum", "Derinlik", "Zaman", "Kaynak", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px 6px 0", color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: "0.72rem", whiteSpace: "nowrap", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((eq, i) => {
                const isNew = liveAlerts.some((a) => a.id === eq.id);
                return (
                  <tr key={eq.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: isNew ? `${magColor(eq.magnitude)}12` : "transparent", transition: "background 0.4s" }}>
                    <td style={{ padding: "8px 10px 8px 0", color: "rgba(255,255,255,0.25)", fontSize: "0.72rem" }}>{i + 1}</td>
                    <td style={{ padding: "8px 10px 8px 0" }}>
                      <Flex align="center" gap={2}>
                        <span style={{ background: magColor(eq.magnitude), color: "#000", borderRadius: 5, padding: "2px 9px", fontWeight: 800, fontSize: "0.82rem", minWidth: 50, textAlign: "center" }}>
                          M{eq.magnitude.toFixed(1)}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: magColor(eq.magnitude), fontWeight: 600 }}>{magLabel(eq.magnitude)}</span>
                      </Flex>
                    </td>
                    <td style={{ padding: "8px 10px 8px 0", maxWidth: 240 }}>
                      <Text fontSize="0.78rem" fontWeight={500} style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }} title={eq.location_name}>
                        {eq.location_name}
                      </Text>
                      <Text fontSize="10px" color="whiteAlpha.400" fontFamily="monospace">{eq.lat.toFixed(3)}, {eq.lng.toFixed(3)}</Text>
                    </td>
                    <td style={{ padding: "8px 10px 8px 0", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                      {eq.depth_km != null ? `${eq.depth_km.toFixed(0)} km` : "—"}
                    </td>
                    <td style={{ padding: "8px 10px 8px 0", whiteSpace: "nowrap" }}>
                      <Text fontSize="0.75rem" color="whiteAlpha.600">{new Date(eq.event_time).toLocaleString("tr-TR")}</Text>
                      <Text fontSize="10px" color="whiteAlpha.400">{timeSince(eq.event_time)}</Text>
                    </td>
                    <td style={{ padding: "8px 10px 8px 0" }}>
                      <span style={{ background: eq.source === "AFAD" ? "rgba(59,130,246,0.15)" : "rgba(99,102,241,0.15)", color: eq.source === "AFAD" ? "#60a5fa" : "#a78bfa", borderRadius: 4, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 700 }}>
                        {eq.source}
                      </span>
                    </td>
                    <td style={{ padding: "8px 0" }}>
                      {eq.url && (
                        <a href={eq.url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", display: "inline-flex" }}>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>

        {!loading && items.length === 0 && !error && (
          <Text color="whiteAlpha.500" py={8} fontSize="sm" textAlign="center">
            Seçilen kriterlerde deprem bulunamadı.
          </Text>
        )}
      </StkGlassCard>
    </StkPageShell>
  );
};

export default EarthquakePage;
