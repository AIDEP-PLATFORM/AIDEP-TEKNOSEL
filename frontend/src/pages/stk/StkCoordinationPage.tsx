import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  ClipboardList,
  MapPin,
  Radio,
  Users,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  assignTeamToDamage,
  calculateRoute,
  createTeam,
  fetchDamageReports,
  fetchTeams,
  fetchVolunteers,
  updateTeamStatus,
} from "../../api/aidepApi";
import StkGlassCard from "../../components/stk/StkGlassCard";
import StkPageShell from "../../components/stk/StkPageShell";
import type { DamageReport, Team, Volunteer } from "../../types/api";
import { useAuthStore } from "../../stores/authStore";

const StatMini: React.FC<{
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}> = ({ title, value, hint, icon }) => (
  <StkGlassCard p={5}>
    <Flex justify="space-between" align="flex-start" mb={3}>
      <Text
        fontSize="10px"
        color="whiteAlpha.500"
        letterSpacing="wider"
        fontWeight="700"
      >
        {title}
      </Text>
      <Box color="#ff5555" opacity={0.9}>
        {icon}
      </Box>
    </Flex>
    <Text fontSize="2xl" fontWeight="800" color="white" mb={1}>
      {value}
    </Text>
    <Text fontSize="xs" color="whiteAlpha.500">
      {hint}
    </Text>
  </StkGlassCard>
);

const StkCoordinationPage: React.FC = () => {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [damages, setDamages] = useState<DamageReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamOrg, setNewTeamOrg] = useState(user?.organization ?? "");
  const [newTeamMax, setNewTeamMax] = useState(10);
  const [creating, setCreating] = useState(false);

  const [routeStartLat, setRouteStartLat] = useState("41.0082");
  const [routeStartLng, setRouteStartLng] = useState("28.9784");
  const [routeEndLat, setRouteEndLat] = useState("41.05");
  const [routeEndLng, setRouteEndLng] = useState("29.0");
  const [routeResult, setRouteResult] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [t, v, d] = await Promise.all([
        fetchTeams(),
        fetchVolunteers(),
        fetchDamageReports({ limit: 80 }),
      ]);
      setTeams(t);
      setVolunteers(v);
      setDamages(d.items);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Veriler yüklenemedi (STK yetkisi gerekir).",
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (user?.organization) setNewTeamOrg(user.organization);
  }, [user?.organization]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !newTeamOrg.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await createTeam({
        name: newTeamName.trim(),
        organization: newTeamOrg.trim(),
        max_size: newTeamMax,
      });
      setNewTeamName("");
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Ekip oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  const handleTeamStatus = async (teamId: string, status: string) => {
    try {
      await updateTeamStatus(teamId, status);
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Durum güncellenemedi.");
    }
  };

  const handleAssign = async (teamId: string, damageId: string) => {
    if (!damageId) return;
    try {
      await assignTeamToDamage(teamId, { damage_report_id: damageId });
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Atama başarısız.");
    }
  };

  const handleRoute = async () => {
    setRouteLoading(true);
    setRouteResult(null);
    try {
      const r = await calculateRoute({
        start_lat: Number.parseFloat(routeStartLat),
        start_lng: Number.parseFloat(routeStartLng),
        end_lat: Number.parseFloat(routeEndLat),
        end_lng: Number.parseFloat(routeEndLng),
      });
      const km = r.distance_meters != null ? (r.distance_meters / 1000).toFixed(2) : "—";
      const min =
        r.duration_seconds != null
          ? Math.round(r.duration_seconds / 60)
          : "—";
      setRouteResult(
        `Mesafe ~${km} km, süre ~${min} dk (risk: ${r.risk_score ?? "—"})`,
      );
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setRouteResult(
        typeof detail === "string" ? detail : "Rota hesaplanamadı (OSRM).",
      );
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <StkPageShell
      title="Koordinasyon"
      subtitle="Ekipler ve gönüllüler (/volunteers/*), hasar raporlarına atama ve rota hesaplama (/routing/calculate)."
    >
      {error && (
        <Text color="red.300" fontSize="sm" mb={4}>
          {error}
        </Text>
      )}

      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        gap={4}
        mb={8}
      >
        <StatMini
          title="EKİPLER"
          value={String(teams.length)}
          hint="POST /volunteers/teams"
          icon={<ClipboardList size={20} />}
        />
        <StatMini
          title="GÖNÜLLÜLER"
          value={String(volunteers.length)}
          hint="GET /volunteers"
          icon={<MapPin size={20} />}
        />
        <StatMini
          title="HASAR KAYDI"
          value={String(damages.length)}
          hint="Liste (limit 80)"
          icon={<Radio size={20} />}
        />
      </Grid>

      <StkGlassCard mb={6}>
        <Text fontWeight="700" color="white" mb={3}>
          Yeni ekip oluştur
        </Text>
        <Flex direction="column" gap={3} maxW="480px">
          <input
            className="auth-input"
            placeholder="Ekip adı"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Kurum"
            value={newTeamOrg}
            onChange={(e) => setNewTeamOrg(e.target.value)}
          />
          <Flex align="center" gap={3}>
            <Text fontSize="sm" color="whiteAlpha.700" whiteSpace="nowrap">
              Max üye
            </Text>
            <input
              className="auth-input"
              type="number"
              min={2}
              max={50}
              value={newTeamMax}
              onChange={(e) => setNewTeamMax(Number(e.target.value))}
            />
          </Flex>
          <button
            type="button"
            className="auth-btn"
            style={{ maxWidth: 280 }}
            disabled={creating}
            onClick={() => void handleCreateTeam()}
          >
            {creating ? "Oluşturuluyor…" : "Ekip oluştur"}
          </button>
        </Flex>
      </StkGlassCard>

      <StkGlassCard mb={6}>
        <Text fontWeight="700" color="white" mb={3}>
          Ekipler
        </Text>
        <Box overflowX="auto">
          <Box as="table" width="100%" fontSize="sm" color="whiteAlpha.800">
            <Box as="thead">
              <Box as="tr" borderBottom="1px solid rgba(255,255,255,0.1)">
                <Box as="th" textAlign="left" py={2}>
                  Ad
                </Box>
                <Box as="th" textAlign="left" py={2}>
                  Kurum
                </Box>
                <Box as="th" textAlign="left" py={2}>
                  Durum
                </Box>
                <Box as="th" textAlign="left" py={2}>
                  Üye
                </Box>
                <Box as="th" textAlign="left" py={2}>
                  İşlem
                </Box>
              </Box>
            </Box>
            <Box as="tbody">
              {teams.map((t) => (
                <Box
                  as="tr"
                  key={t.id}
                  borderBottom="1px solid rgba(255,255,255,0.06)"
                >
                  <Box as="td" py={2}>
                    {t.name}
                  </Box>
                  <Box as="td" py={2}>
                    {t.organization}
                  </Box>
                  <Box as="td" py={2}>
                    {t.status}
                  </Box>
                  <Box as="td" py={2}>
                    {t.member_count ?? "—"}
                  </Box>
                  <Box as="td" py={2}>
                    <Flex gap={2} flexWrap="wrap">
                      <select
                        className="auth-input"
                        style={{ maxWidth: 140, padding: "8px 10px" }}
                        value={t.status}
                        onChange={(e) =>
                          void handleTeamStatus(t.id, e.target.value)
                        }
                      >
                        <option value="available">available</option>
                        <option value="on_mission">on_mission</option>
                        <option value="inactive">inactive</option>
                      </select>
                      <select
                        className="auth-input"
                        style={{ maxWidth: 200, padding: "8px 10px" }}
                        defaultValue=""
                        onChange={(e) => {
                          const v = e.target.value;
                          e.target.selectedIndex = 0;
                          if (v) void handleAssign(t.id, v);
                        }}
                      >
                        <option value="">Hasara ata…</option>
                        {damages.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.id.slice(0, 8)}…
                          </option>
                        ))}
                      </select>
                    </Flex>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
          {teams.length === 0 && (
            <Text fontSize="sm" color="whiteAlpha.500" py={4}>
              Henüz ekip yok.
            </Text>
          )}
        </Box>
      </StkGlassCard>

      <StkGlassCard mb={6}>
        <Flex align="center" gap={3} mb={3}>
          <Box color="#94a3b8">
            <Users size={22} />
          </Box>
          <Text fontWeight="700" color="white">
            Gönüllüler (salt okuma)
          </Text>
        </Flex>
        <Box overflowX="auto">
          <Box as="table" width="100%" fontSize="sm" color="whiteAlpha.800">
            <Box as="thead">
              <Box as="tr" borderBottom="1px solid rgba(255,255,255,0.1)">
                <Box as="th" textAlign="left" py={2}>
                  Kullanıcı
                </Box>
                <Box as="th" textAlign="left" py={2}>
                  Durum
                </Box>
                <Box as="th" textAlign="left" py={2}>
                  Müsait
                </Box>
                <Box as="th" textAlign="left" py={2}>
                  Ekip
                </Box>
              </Box>
            </Box>
            <Box as="tbody">
              {volunteers.map((v) => (
                <Box
                  as="tr"
                  key={v.id}
                  borderBottom="1px solid rgba(255,255,255,0.06)"
                >
                  <Box as="td" py={2} fontFamily="mono" fontSize="xs">
                    {v.user_id}
                  </Box>
                  <Box as="td" py={2}>
                    {v.status}
                  </Box>
                  <Box as="td" py={2}>
                    {v.is_available ? "Evet" : "Hayır"}
                  </Box>
                  <Box as="td" py={2} fontFamily="mono" fontSize="xs">
                    {v.team_id ?? "—"}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
          {volunteers.length === 0 && (
            <Text fontSize="sm" color="whiteAlpha.500" py={4}>
              Gönüllü kaydı yok.
            </Text>
          )}
        </Box>
      </StkGlassCard>

      <StkGlassCard>
        <Text fontWeight="700" color="white" mb={3}>
          Rota hesapla (OSRM)
        </Text>
        <Text fontSize="xs" color="whiteAlpha.500" mb={3}>
          POST /routing/calculate — koordinatları derece cinsinden girin.
        </Text>
        <Grid
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
          gap={3}
          maxW="560px"
        >
          <input
            className="auth-input"
            placeholder="Başlangıç lat"
            value={routeStartLat}
            onChange={(e) => setRouteStartLat(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Başlangıç lng"
            value={routeStartLng}
            onChange={(e) => setRouteStartLng(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Bitiş lat"
            value={routeEndLat}
            onChange={(e) => setRouteEndLat(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Bitiş lng"
            value={routeEndLng}
            onChange={(e) => setRouteEndLng(e.target.value)}
          />
        </Grid>
        <Flex mt={3} gap={3} align="center" flexWrap="wrap">
          <button
            type="button"
            className="auth-btn auth-btn--ghost"
            disabled={routeLoading}
            onClick={() => void handleRoute()}
          >
            {routeLoading ? "Hesaplanıyor…" : "Hesapla"}
          </button>
          {routeResult && (
            <Text fontSize="sm" color="whiteAlpha.800">
              {routeResult}
            </Text>
          )}
        </Flex>
      </StkGlassCard>
    </StkPageShell>
  );
};

export default StkCoordinationPage;
