import { Box, Flex, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Radio,
  Search,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import MapContainer, { type RouteRequest, type RouteResult } from "../components/map/MapContainer";
import StkGlassCard from "../components/stk/StkGlassCard";
import StkPageShell from "../components/stk/StkPageShell";
import damageService from "../services/damage.service";
import routingService from "../services/routing.service";
import volunteerService from "../services/volunteer.service";
import type { DamageReport, Team } from "../types/api";

/* ── Sabitler ────────────────────────────────────────────────────────── */

const SEV_COLOR: Record<number, string> = { 1: "#22c55e", 2: "#86efac", 3: "#fbbf24", 4: "#f97316", 5: "#ef4444" };

const WS_URL = (import.meta.env.VITE_WS_URL || "ws://localhost/ws") + "/damage";

function riskColor(s: number | null) {
  if (s == null) return "#3b82f6";
  if (s >= 7) return "#ef4444";
  if (s >= 4) return "#f59e0b";
  return "#22c55e";
}

/* ── Nominatim ──────────────────────────────────────────────────────── */

interface NominatimResult { display_name: string; lat: string; lon: string; }

async function searchPlace(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=tr&countrycodes=tr`;
  const res = await fetch(url, { headers: { "Accept-Language": "tr" } });
  return res.json() as Promise<NominatimResult[]>;
}

/* ── Tipler ──────────────────────────────────────────────────────────── */

interface LiveNotif { id: string; damage_class: string | null; severity: number | null; }

interface RoutePoint { label: string; lat: number; lng: number; }

/* ── PlaceSearch ─────────────────────────────────────────────────────── */

const PlaceSearch: React.FC<{
  placeholder: string;
  value: RoutePoint | null;
  onSelect: (p: RoutePoint) => void;
  onClear: () => void;
  pickActive: boolean;
  onPickToggle: () => void;
  color: string;
}> = ({ placeholder, value, onSelect, onClear, pickActive, onPickToggle, color }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const deb = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = (q: string) => {
    setQuery(q);
    if (deb.current) clearTimeout(deb.current);
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    deb.current = setTimeout(async () => {
      setSearching(true);
      try { const r = await searchPlace(q); setResults(r); setOpen(r.length > 0); }
      finally { setSearching(false); }
    }, 400);
  };

  const pick = (r: NominatimResult) => {
    onSelect({ label: r.display_name.split(",").slice(0, 2).join(",").trim(), lat: Number(r.lat), lng: Number(r.lon) });
    setQuery(""); setResults([]); setOpen(false);
  };

  return (
    <Box position="relative">
      {value ? (
        <Flex align="center" gap={2} bg="rgba(255,255,255,0.08)" border={`1.5px solid ${color}66`} borderRadius={8} px={3} py="8px">
          <MapPin size={12} color={color} style={{ flexShrink: 0 }} />
          <Text fontSize="0.78rem" color="white" flex={1} style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }} title={value.label}>
            {value.label}
          </Text>
          <button type="button" onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0, lineHeight: 1 }}>
            <X size={12} />
          </button>
        </Flex>
      ) : (
        <Flex gap={2}>
          <Box position="relative" flex={1}>
            <input
              className="auth-input"
              placeholder={placeholder}
              value={query}
              onChange={(e) => search(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              style={{ fontSize: "0.78rem", paddingRight: 32, paddingTop: 7, paddingBottom: 7 }}
            />
            <Box position="absolute" right={8} top="50%" transform="translateY(-50%)" color="whiteAlpha.400">
              {searching ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={12} />}
            </Box>
          </Box>
          <button type="button" onClick={onPickToggle} title="Haritadan seç"
            style={{ background: pickActive ? color : "rgba(255,255,255,0.08)", border: `1.5px solid ${pickActive ? color : "rgba(255,255,255,0.15)"}`, borderRadius: 7, padding: "0 9px", cursor: "pointer", color: pickActive ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "0.72rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s" }}>
            <MapPin size={11} />
            {pickActive ? "Seçiliyor…" : "Haritadan"}
          </button>
        </Flex>
      )}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
            style={{ position: "absolute", top: "calc(100% + 3px)", left: 0, right: 0, background: "#0f172a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 8, zIndex: 9999, boxShadow: "0 10px 40px rgba(0,0,0,0.6)", overflow: "hidden" }}>
            {results.map((r, i) => (
              <button key={i} type="button" onMouseDown={() => pick(r)}
                style={{ width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", borderBottom: i < results.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", cursor: "pointer", color: "rgba(255,255,255,0.85)", fontSize: "0.75rem", display: "flex", gap: 7, alignItems: "flex-start" }}>
                <MapPin size={11} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ lineHeight: 1.4 }}>{r.display_name.split(",").slice(0, 3).join(", ")}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

/* ── Ana sayfa ────────────────────────────────────────────────────────── */

const MapPage: React.FC = () => {
  const [items, setItems] = useState<DamageReport[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);

  /* Canlı rapor */
  const [liveReport, setLiveReport] = useState<DamageReport | null>(null);
  const [notifications, setNotifications] = useState<LiveNotif[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Panel: "route" | "team" | null */
  const [panel, setPanel] = useState<"route" | "team" | null>(null);

  /* Manuel rota */
  const [startPoint, setStartPoint] = useState<RoutePoint | null>({ label: "Konya Merkez", lat: 37.8715, lng: 32.4846 });
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [pickMode, setPickMode] = useState<"start" | "end" | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  /* Ekip yönlendirme */
  const [teamRouteReq, setTeamRouteReq] = useState<RouteRequest | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [teamRouteLoading, setTeamRouteLoading] = useState(false);
  const [teamRouteResult, setTeamRouteResult] = useState<RouteResult | null>(null);
  const [teamRouteInfo, setTeamRouteInfo] = useState<string | null>(null);
  const [teamRouteError, setTeamRouteError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    try {
      const res = await damageService.fetchAll({ limit: 200, skip: 0 });
      setItems(res.items); setTotal(res.total);
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof d === "string" ? d : "Hasar listesi alınamadı.");
    } finally { setLoading(false); }
  }, []);

  const loadTeams = useCallback(async () => {
    try { setTeams(await volunteerService.fetchTeams()); } catch { /* opsiyonel */ }
  }, []);

  useEffect(() => { void loadReports(); void loadTeams(); }, [loadReports, loadTeams]);

  /* WebSocket */
  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as { type: string; data: DamageReport };
        if (msg.type !== "new_damage") return;
        const r = msg.data;
        setItems((prev) => [r, ...prev]);
        setTotal((t) => t + 1);
        setLiveReport(r);
        setNotifications((prev) => [{ id: r.id, damage_class: r.damage_class, severity: r.severity }, ...prev.slice(0, 3)]);
        setTimeout(() => setLiveReport(null), 8000);
      } catch { /* ignore */ }
    };
    ws.onclose = () => { reconnectTimer.current = setTimeout(connectWs, 5000); };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connectWs();
    return () => { wsRef.current?.close(); if (reconnectTimer.current) clearTimeout(reconnectTimer.current); };
  }, [connectWs]);

  /* Haritadan nokta seçildi */
  const handlePointPicked = useCallback((lat: number, lng: number, which: "start" | "end") => {
    const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    if (which === "start") setStartPoint({ label, lat, lng });
    else setEndPoint({ label, lat, lng });
    setPickMode(null);
  }, []);

  /* Hasar popup → ekip yönlendir */
  const handleRouteRequest = useCallback((req: RouteRequest) => {
    setTeamRouteReq(req);
    setSelectedTeamId("");
    setTeamRouteResult(null); setTeamRouteInfo(null); setTeamRouteError(null);
    setPanel("team");
  }, []);

  /* Manuel rota hesapla */
  const handleRoute = async () => {
    if (!startPoint || !endPoint) return;
    setRouteError(null); setRouteInfo(null); setRouteResult(null); setTeamRouteResult(null);
    setRouteLoading(true);
    try {
      const r = await routingService.calculate({ start_lat: startPoint.lat, start_lng: startPoint.lng, end_lat: endPoint.lat, end_lng: endPoint.lng });
      if (!r.coordinates?.length) { setRouteError("Rota koordinatları döndürülmedi."); return; }
      setRouteResult({ coordinates: r.coordinates, distanceMeters: r.distance_meters, durationSeconds: r.duration_seconds, riskScore: r.risk_score, startLabel: startPoint.label, endLabel: endPoint.label });
      const km = r.distance_meters != null ? (r.distance_meters / 1000).toFixed(1) : "—";
      const min = r.duration_seconds != null ? Math.round(r.duration_seconds / 60) : "—";
      const risk = r.risk_score != null ? (r.risk_score >= 7 ? " · ⚠️ Yüksek Risk" : r.risk_score >= 4 ? " · Orta Risk" : " · Güvenli") : "";
      setRouteInfo(`~${km} km · ~${min} dk${risk}`);
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setRouteError(typeof d === "string" ? d : "Rota hesaplanamadı.");
    } finally { setRouteLoading(false); }
  };

  /* Ekip yönlendirme rotası */
  const handleTeamRoute = async () => {
    if (!teamRouteReq || !selectedTeamId) return;
    const team = teams.find((t) => t.id === selectedTeamId);
    if (!team?.lat || !team?.lng) { setTeamRouteError("Seçilen ekibin harita konumu mevcut değil."); return; }
    setTeamRouteError(null); setTeamRouteInfo(null); setTeamRouteResult(null); setRouteResult(null);
    setTeamRouteLoading(true);
    try {
      await volunteerService.assignToDamage(selectedTeamId, { damage_report_id: teamRouteReq.damageId });
      const r = await routingService.calculate({ start_lat: team.lat, start_lng: team.lng, end_lat: teamRouteReq.lat, end_lng: teamRouteReq.lng });
      if (!r.coordinates?.length) { setTeamRouteError("Rota koordinatları döndürülmedi."); return; }
      setTeamRouteResult({ coordinates: r.coordinates, distanceMeters: r.distance_meters, durationSeconds: r.duration_seconds, riskScore: r.risk_score, startLabel: `${team.name} (mevcut konum)`, endLabel: teamRouteReq.label });
      const km = r.distance_meters != null ? (r.distance_meters / 1000).toFixed(1) : "—";
      const min = r.duration_seconds != null ? Math.round(r.duration_seconds / 60) : "—";
      const risk = r.risk_score != null ? (r.risk_score >= 7 ? " ⚠️ Yüksek Risk" : r.risk_score >= 4 ? " Orta Risk" : " Güvenli") : "";
      setTeamRouteInfo(`${team.name}: ~${km} km · ~${min} dk ·${risk}`);
      void loadTeams();
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setTeamRouteError(typeof d === "string" ? d : "Rota veya atama başarısız.");
    } finally { setTeamRouteLoading(false); }
  };

  const mapsUrl = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;
  const isOpen = panel !== null;
  const wsConnected = wsRef.current?.readyState === WebSocket.OPEN;
  const activeRoute = teamRouteResult ?? routeResult;

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <StkPageShell title="Canlı Harita">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {error && <Text color="red.300" fontSize="sm" mb={3}>{error}</Text>}

      {/* Canlı bildirimler */}
      <Box position="fixed" bottom={6} right={6} zIndex={9999} display="flex" flexDirection="column" gap={2}>
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} transition={{ duration: 0.3 }}>
              <Box bg="rgba(15,23,42,0.95)" border="1px solid rgba(239,68,68,0.4)" borderRadius={10} px={4} py={3} minW="230px" boxShadow="0 8px 32px rgba(0,0,0,0.45)" display="flex" alignItems="flex-start" gap={3}>
                <AlertTriangle size={15} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="700" color="#fca5a5">Yeni Hasar Bildirimi</Text>
                  <Text fontSize="xs" color="whiteAlpha.800" mt={0.5}>
                    {n.damage_class ?? "Bilinmeyen hasar"}
                    {n.severity != null && <span style={{ marginLeft: 6, background: SEV_COLOR[n.severity], color: "#000", borderRadius: 4, padding: "0 6px", fontWeight: 700 }}>Şiddet {n.severity}</span>}
                  </Text>
                </Box>
                <button type="button" onClick={() => setNotifications((p) => p.filter((x) => x.id !== n.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0 }}>
                  <X size={13} />
                </button>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* Harita kartı */}
      <StkGlassCard style={{ padding: 0, overflow: "hidden" }}>
        {/* ── Harita alanı + sol overlay panel ── */}
        <Box position="relative" h={{ base: "500px", md: "640px" }} display="flex">

          {/* Sol panel (overlay) */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="side-panel"
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: 300, zIndex: 800,
                  background: "rgba(10,18,35,0.92)",
                  backdropFilter: "blur(14px)",
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "inherit",
                  display: "flex", flexDirection: "column",
                  overflowY: "auto",
                }}
              >
                {/* Panel başlık */}
                <Flex align="center" justify="space-between" px={4} pt={4} pb={3} borderBottom="1px solid rgba(255,255,255,0.07)">
                  <Flex align="center" gap={2}>
                    {panel === "team" ? <Navigation size={14} color="#ef4444" /> : <Navigation size={14} color="#3b82f6" />}
                    <Text fontSize="0.82rem" fontWeight="700" color="white">
                      {panel === "team" ? "Ekip Yönlendir" : "Rota Hesapla"}
                    </Text>
                  </Flex>
                  <button type="button" onClick={() => { setPanel(null); setPickMode(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0 }}>
                    <X size={14} />
                  </button>
                </Flex>

                <Box px={4} pt={3} pb={4} flex={1}>
                  {/* ── EKIP YÖNLENDİRME ── */}
                  {panel === "team" && teamRouteReq && (
                    <>
                      {/* Hedef hasar */}
                      <Box bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.2)" borderRadius={8} px={3} py={2} mb={4}>
                        <Text fontSize="10px" color="whiteAlpha.500" mb={0.5} fontWeight="700" letterSpacing="wider">HEDEF HASAR</Text>
                        <Text fontSize="0.78rem" color="white" fontWeight="600">{teamRouteReq.label}</Text>
                        <Text fontSize="10px" color="whiteAlpha.400" fontFamily="monospace">{teamRouteReq.lat.toFixed(5)}, {teamRouteReq.lng.toFixed(5)}</Text>
                      </Box>

                      {/* Ekip seç */}
                      <Text fontSize="10px" color="whiteAlpha.500" mb={1} fontWeight="700" letterSpacing="wider">EKİP SEÇ</Text>
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.78rem", outline: "none", marginBottom: 12 }}
                      >
                        <option value="" style={{ background: "#0f172a" }}>— Ekip seçin —</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id} style={{ background: "#0f172a" }}>
                            {t.name} · {t.status === "available" ? "Müsait" : t.status === "on_mission" ? "Görevde" : "Pasif"}
                            {!t.lat ? " ⚠️" : ""}
                          </option>
                        ))}
                      </select>

                      <button type="button" className="auth-btn" disabled={teamRouteLoading || !selectedTeamId} onClick={() => void handleTeamRoute()}
                        style={{ width: "100%", padding: "9px 0", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#ef4444", borderColor: "#ef4444" }}>
                        {teamRouteLoading ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Yönlendiriliyor…</> : <><Navigation size={13} /> Rotayı Ata ve Göster</>}
                      </button>

                      {teamRouteResult && (
                        <button type="button" className="auth-btn auth-btn--ghost" onClick={() => { setTeamRouteResult(null); setTeamRouteInfo(null); }}
                          style={{ width: "100%", padding: "7px 0", fontSize: "0.78rem", marginTop: 8 }}>Rotayı Temizle</button>
                      )}

                      {teamRouteInfo && (
                        <Box mt={3} p={3} bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)" borderRadius={8}>
                          <Text fontSize="0.78rem" fontWeight="700" style={{ color: riskColor(teamRouteResult?.riskScore ?? null) }}>{teamRouteInfo}</Text>
                        </Box>
                      )}
                      {teamRouteError && <Text fontSize="xs" color="red.300" mt={2}>{teamRouteError}</Text>}
                    </>
                  )}

                  {/* ── MANUEL ROTA ── */}
                  {panel === "route" && (
                    <>
                      <Text fontSize="10px" color="whiteAlpha.500" mb={1} fontWeight="700" letterSpacing="wider">BAŞLANGIÇ</Text>
                      <Box mb={3}>
                        <PlaceSearch placeholder="Başlangıç noktası ara…" value={startPoint} onSelect={setStartPoint} onClear={() => setStartPoint(null)} pickActive={pickMode === "start"} onPickToggle={() => setPickMode((m) => m === "start" ? null : "start")} color="#3b82f6" />
                      </Box>

                      <Text fontSize="10px" color="whiteAlpha.500" mb={1} fontWeight="700" letterSpacing="wider">VARIŞ</Text>
                      <Box mb={3}>
                        <PlaceSearch placeholder="Varış noktası ara…" value={endPoint} onSelect={setEndPoint} onClear={() => setEndPoint(null)} pickActive={pickMode === "end"} onPickToggle={() => setPickMode((m) => m === "end" ? null : "end")} color="#ef4444" />
                      </Box>

                      <AnimatePresence>
                        {pickMode && (
                          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Flex align="center" gap={2} mb={3} p={2} bg="rgba(255,255,255,0.04)" borderRadius={7}>
                              <MapPin size={11} color={pickMode === "start" ? "#3b82f6" : "#ef4444"} />
                              <Text fontSize="xs" color={pickMode === "start" ? "blue.300" : "red.300"} flex={1}>
                                Haritada {pickMode === "start" ? "başlangıç" : "varış"} noktasını tıklayın
                              </Text>
                              <button type="button" onClick={() => setPickMode(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0 }}>
                                <X size={11} />
                              </button>
                            </Flex>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button type="button" className="auth-btn" disabled={routeLoading || !startPoint || !endPoint} onClick={() => void handleRoute()}
                        style={{ width: "100%", padding: "9px 0", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        {routeLoading ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Hesaplanıyor…</> : <><Navigation size={13} /> Rotayı Göster</>}
                      </button>

                      {routeResult && (
                        <button type="button" className="auth-btn auth-btn--ghost" onClick={() => { setRouteResult(null); setRouteInfo(null); }}
                          style={{ width: "100%", padding: "7px 0", fontSize: "0.78rem", marginTop: 8 }}>Rotayı Temizle</button>
                      )}

                      {routeInfo && (
                        <Box mt={3} p={3} bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)" borderRadius={8}>
                          <Text fontSize="0.78rem" fontWeight="700" style={{ color: riskColor(routeResult?.riskScore ?? null) }}>{routeInfo}</Text>
                        </Box>
                      )}
                      {routeError && <Text fontSize="xs" color="red.300" mt={2}>{routeError}</Text>}
                    </>
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rota butonu — sol üst (panel kapalıyken) */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: "absolute", left: 12, top: 12, zIndex: 700, display: "flex", flexDirection: "column", gap: 6 }}>
                <button type="button" onClick={() => setPanel("route")}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", background: "rgba(10,18,35,0.88)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 9, color: "#fff", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                  <Navigation size={13} color="#3b82f6" /> Rota Hesapla
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Panel aç/kapa kolu (panel açıkken sağ kenarında) */}
          <AnimatePresence>
            {isOpen && (
              <motion.button
                key="toggle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                type="button"
                onClick={() => { setPanel(null); setPickMode(null); }}
                style={{ position: "absolute", left: 300, top: "50%", transform: "translateY(-50%)", zIndex: 801, background: "rgba(10,18,35,0.88)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0 8px 8px 0", padding: "12px 4px", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}
              >
                <ChevronLeft size={15} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Sağ alt bilgi çubuğu */}
          <Box position="absolute" right={50} bottom={3} zIndex={700} display="flex" alignItems="center" gap={3}
            style={{ background: "rgba(10,18,35,0.78)", backdropFilter: "blur(10px)", borderRadius: 8, padding: "5px 12px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Flex align="center" gap={1.5}>
              <Radio size={11} color={wsConnected ? "#4ade80" : "#94a3b8"} />
              <Text fontSize="10px" color={wsConnected ? "green.300" : "whiteAlpha.400"} fontWeight={600}>
                {wsConnected ? "Canlı" : "Bağlanıyor"}
              </Text>
            </Flex>
            {teams.filter((t) => t.lat).length > 0 && (
              <>
                <Box w="1px" h="12px" bg="rgba(255,255,255,0.1)" />
                <Flex align="center" gap={1.5}>
                  <Users size={11} color="#3b82f6" />
                  <Text fontSize="10px" color="blue.300" fontWeight={600}>{teams.filter((t) => t.lat).length} ekip</Text>
                </Flex>
              </>
            )}
            <Box w="1px" h="12px" bg="rgba(255,255,255,0.1)" />
            <Flex align="center" gap={1.5}>
              <MapPin size={11} color="#ef4444" />
              <Text fontSize="10px" color="whiteAlpha.500">{total} hasar</Text>
            </Flex>
          </Box>

          {/* Harita */}
          <Box flex={1} position="relative">
            {loading ? (
              <Flex h="100%" align="center" justify="center">
                <Text color="whiteAlpha.500" fontSize="sm">Yükleniyor…</Text>
              </Flex>
            ) : (
              <MapContainer
                reports={items}
                teams={teams}
                route={activeRoute}
                liveReport={liveReport}
                clickMode={pickMode}
                onPointPicked={handlePointPicked}
                onRouteRequest={handleRouteRequest}
              />
            )}
          </Box>
        </Box>
      </StkGlassCard>

      {/* Panel açılacak ok butonu (panel kapandıktan sonra, sağ kenarda küçük ikon) */}
      {!isOpen && panel === null && (
        <Box display="none">
          <ChevronRight size={14} />
        </Box>
      )}

      {/* Rapor tablosu */}
      <StkGlassCard>
        <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
          <Flex align="center" gap={2}>
            <MapPin size={15} color="#ef4444" />
            <Text fontSize="sm" fontWeight="600" color="white">Hasar Raporları</Text>
          </Flex>
          <Text fontSize="xs" color="whiteAlpha.500">Toplam: {loading ? "…" : total}</Text>
        </Flex>

        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", color: "rgba(255,255,255,0.88)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                {["#", "Tarih", "Hasar Türü", "Durum", "Şiddet", "Konum", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 8px 6px 0", color: "rgba(255,255,255,0.45)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: liveReport?.id === r.id ? "rgba(239,68,68,0.08)" : "transparent", transition: "background 0.3s" }}>
                  <td style={{ padding: "7px 8px 7px 0", color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>{i + 1}</td>
                  <td style={{ padding: "7px 8px 7px 0", whiteSpace: "nowrap", color: "rgba(255,255,255,0.6)" }}>{new Date(r.created_at).toLocaleString("tr-TR")}</td>
                  <td style={{ padding: "7px 8px 7px 0", fontWeight: 500 }}>{r.damage_class ?? "—"}</td>
                  <td style={{ padding: "7px 8px 7px 0" }}>{r.status}</td>
                  <td style={{ padding: "7px 8px 7px 0" }}>
                    {r.severity != null ? <span style={{ background: SEV_COLOR[r.severity], color: "#000", borderRadius: 4, padding: "1px 7px", fontWeight: 700, fontSize: "0.72rem" }}>{r.severity}</span> : "—"}
                  </td>
                  <td style={{ padding: "7px 8px 7px 0", fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
                    {r.lat != null && r.lng != null ? `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}` : "—"}
                  </td>
                  <td style={{ padding: "7px 0" }}>
                    {r.lat != null && r.lng != null ? (
                      <a href={mapsUrl(r.lat, r.lng)} target="_blank" rel="noreferrer" style={{ color: "#ff5555", display: "inline-flex" }}>
                        <ExternalLink size={12} />
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {!loading && items.length === 0 && !error && (
          <Text color="whiteAlpha.500" py={6} fontSize="sm" textAlign="center">Henüz hasar raporu yok.</Text>
        )}
      </StkGlassCard>
    </StkPageShell>
  );
};

export default MapPage;
