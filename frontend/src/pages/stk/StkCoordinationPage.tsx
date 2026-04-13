import { Box, Flex, Grid, Menu, Text } from "@chakra-ui/react";
import {
  ChevronDown,
  ClipboardList,
  MapPin,
  Navigation,
  Shield,
  Users,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import StkGlassCard from "../../components/stk/StkGlassCard";
import StkPageShell from "../../components/stk/StkPageShell";
import damageService from "../../services/damage.service";
import routingService from "../../services/routing.service";
import volunteerService from "../../services/volunteer.service";
import { useAuthStore } from "../../stores/authStore";
import type { DamageReport, Team, Volunteer } from "../../types/api";

const TEAM_STATUS_LABEL: Record<string, string> = {
  available: "Müsait",
  on_mission: "Görevde",
  inactive: "Pasif",
};

const VOLUNTEER_STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  on_mission: "Görevde",
};

/** Native <select> Windows’ta beyaz/beyaz veya ters kontrastlı liste çizer; STK koyu UI ile Menu kullan. */
const stkMenuPanel = {
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  style: {
    background:
      "linear-gradient(180deg, rgba(30,41,59,0.98) 0%, rgba(22,30,43,0.99) 100%)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
  },
} as const;

const StkMenuTrigger: React.FC<{
  children: React.ReactNode;
  maxW?: string;
}> = ({ children, maxW = "100%" }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        maxWidth: maxW,
        width: "100%",
        padding: "10px 12px",
        fontSize: "0.8rem",
        fontWeight: 500,
        fontFamily: "inherit",
        borderRadius: 10,
        background: hover ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${hover ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.12)"}`,
        color: "rgba(255,255,255,0.92)",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        textAlign: "left",
      }}
    >
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {children}
      </span>
      <ChevronDown
        size={14}
        style={{ opacity: 0.75, flexShrink: 0 }}
        aria-hidden
      />
    </button>
  );
};

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
        volunteerService.fetchTeams(),
        volunteerService.fetchVolunteers(),
        damageService.fetchAll({ limit: 80 }),
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

  const teamNameById = (id: string | null) => {
    if (!id) return "—";
    return teams.find((t) => t.id === id)?.name ?? `${id.slice(0, 8)}…`;
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !newTeamOrg.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await volunteerService.createTeam({
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
      await volunteerService.updateStatus(teamId, status);
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
      await volunteerService.assignToDamage(teamId, {
        damage_report_id: damageId,
      });
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Atama başarısız.");
    }
  };

  /** Gönüllüyü ekibe al (backend: POST /volunteers/teams/{id}/members) */
  const handleVolunteerJoinTeam = async (
    volunteerId: string,
    teamId: string,
  ) => {
    if (!teamId) return;
    setError(null);
    try {
      await volunteerService.addMember(teamId, volunteerId);
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Gönüllü ekibe eklenemedi.",
      );
    }
  };

  /** Gönüllüyü ekipten çıkar */
  const handleVolunteerLeaveTeam = async (
    volunteerId: string,
    teamId: string,
  ) => {
    setError(null);
    try {
      await volunteerService.removeMember(teamId, volunteerId);
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Ekipten çıkarılamadı.");
    }
  };

  const handleRoute = async () => {
    setRouteLoading(true);
    setRouteResult(null);
    try {
      const r = await routingService.calculate({
        start_lat: Number.parseFloat(routeStartLat),
        start_lng: Number.parseFloat(routeStartLng),
        end_lat: Number.parseFloat(routeEndLat),
        end_lng: Number.parseFloat(routeEndLng),
      });
      const km =
        r.distance_meters != null ? (r.distance_meters / 1000).toFixed(2) : "—";
      const min =
        r.duration_seconds != null ? Math.round(r.duration_seconds / 60) : "—";
      setRouteResult(
        `Tahmini mesafe: ~${km} km · Süre: ~${min} dk${r.risk_score != null ? ` · Risk skoru: ${r.risk_score}` : ""}`,
      );
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setRouteResult(
        typeof detail === "string" ? detail : "Rota hesaplanamadı.",
      );
    } finally {
      setRouteLoading(false);
    }
  };

  const damageLabel = (d: DamageReport) => {
    const date = new Date(d.created_at).toLocaleDateString("tr-TR");
    const cls = d.damage_class ?? "Bilinmeyen";
    const sev = d.severity != null ? ` · Şiddet ${d.severity}` : "";
    const loc =
      d.lat != null && d.lng != null
        ? ` · ${d.lat.toFixed(3)},${d.lng.toFixed(3)}`
        : "";
    return `${cls}${sev} — ${date}${loc}`;
  };

  return (
    <StkPageShell
      title="Koordinasyon"
      subtitle="Saha ekiplerinizi yönetin, gönüllüleri izleyin ve hasar noktalarına ekip atayın."
    >
      {error && (
        <Text color="red.300" fontSize="sm" mb={4}>
          {error}
        </Text>
      )}

      {/* Özet kartlar */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        gap={4}
        mb={8}
      >
        <StatMini
          title="AKTİF EKİPLER"
          value={String(teams.length)}
          hint={`${teams.filter((t) => t.status === "available").length} ekip müsait`}
          icon={<ClipboardList size={20} />}
        />
        <StatMini
          title="GÖNÜLLÜLER"
          value={String(volunteers.length)}
          hint={`${volunteers.filter((v) => v.is_available).length} kişi müsait`}
          icon={<Users size={20} />}
        />
        <StatMini
          title="HASAR KAYDI"
          value={String(damages.length)}
          hint={`${damages.filter((d) => d.status === "pending").length} beklemede`}
          icon={<Shield size={20} />}
        />
      </Grid>

      {/* Yeni ekip oluştur */}
      <StkGlassCard mb={6}>
        <Text fontWeight="700" color="white" mb={1}>
          Yeni Ekip Oluştur
        </Text>
        <Text fontSize="xs" color="whiteAlpha.500" mb={4}>
          Kurumunuz adına yeni bir saha ekibi tanımlayın.
        </Text>
        <Flex direction="column" gap={3} maxW="480px">
          <input
            className="auth-input"
            placeholder="Ekip adı (örn. Arama Kurtarma 1)"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Kurum adı"
            value={newTeamOrg}
            onChange={(e) => setNewTeamOrg(e.target.value)}
          />
          <Flex align="center" gap={3}>
            <Text fontSize="sm" color="whiteAlpha.700" whiteSpace="nowrap">
              Maks. üye
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
            {creating ? "Oluşturuluyor…" : "Ekip Oluştur"}
          </button>
        </Flex>
      </StkGlassCard>

      {/* Ekipler tablosu */}
      <StkGlassCard mb={6}>
        <Text fontWeight="700" color="white" mb={1}>
          Ekipler
        </Text>
        <Text fontSize="xs" color="whiteAlpha.500" mb={2}>
          Ekip durumunu değiştirin veya bir hasar bölgesine atayın.
        </Text>
        {damages.length === 0 && (
          <Text fontSize="xs" color="orange.300" mb={4} lineHeight="tall">
            Şu an sistemde listelenecek <strong>hasar kaydı yok</strong>; bu
            yüzden açılır menüde seçenek çıkmaz. Hasar bildirimi (mobil uygulama
            veya API ile <code style={{ opacity: 0.85 }}>POST /damage</code>)
            oluşturulduktan sonra burada görünür. Özet için üstteki{" "}
            <strong>HASAR KAYDI</strong> kartına da bakın — orada da 0 ise kayıt
            yok demektir.
          </Text>
        )}
        <Box overflowX="auto">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.88)",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                {["Ekip Adı", "Kurum", "Durum", "Üye", "İşlem"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "7px 10px 7px 0",
                      color: "rgba(255,255,255,0.45)",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr
                  key={t.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <td style={{ padding: "8px 10px 8px 0", fontWeight: 600 }}>
                    {t.name}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px 8px 0",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {t.organization}
                  </td>
                  <td style={{ padding: "8px 10px 8px 0" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 9px",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        background:
                          t.status === "available"
                            ? "rgba(34,197,94,0.15)"
                            : t.status === "on_mission"
                              ? "rgba(251,191,36,0.15)"
                              : "rgba(148,163,184,0.12)",
                        color:
                          t.status === "available"
                            ? "#4ade80"
                            : t.status === "on_mission"
                              ? "#fbbf24"
                              : "#94a3b8",
                      }}
                    >
                      {TEAM_STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px 10px 8px 0" }}>
                    {t.member_count ?? 0} / {t.max_size}
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    <Flex gap={2} flexWrap="wrap" align="center">
                      <Menu.Root
                        positioning={{ placement: "bottom-start", gutter: 6 }}
                      >
                        <Menu.Trigger asChild>
                          <Box display="inline-block" maxW="160px">
                            <StkMenuTrigger maxW="160px">
                              {TEAM_STATUS_LABEL[t.status] ?? t.status}
                            </StkMenuTrigger>
                          </Box>
                        </Menu.Trigger>
                        <Menu.Positioner>
                          <Menu.Content
                            minW="160px"
                            py={1}
                            px={1}
                            {...stkMenuPanel}
                          >
                            {(
                              ["available", "on_mission", "inactive"] as const
                            ).map((s) => (
                              <Menu.Item
                                key={s}
                                value={s}
                                cursor="pointer"
                                color="whiteAlpha.900"
                                borderRadius="md"
                                py={2}
                                px={2}
                                fontSize="sm"
                                _hover={{
                                  bg: "rgba(255,255,255,0.08)",
                                }}
                                onClick={() => void handleTeamStatus(t.id, s)}
                              >
                                {TEAM_STATUS_LABEL[s]}
                              </Menu.Item>
                            ))}
                          </Menu.Content>
                        </Menu.Positioner>
                      </Menu.Root>

                      {damages.length === 0 ? (
                        <Text
                          as="span"
                          fontSize="0.72rem"
                          color="whiteAlpha.400"
                          whiteSpace="nowrap"
                          title="Önce hasar bildirimi oluşturulmalı"
                        >
                          Hasar kaydı yok
                        </Text>
                      ) : (
                        <Menu.Root
                          positioning={{ placement: "bottom-start", gutter: 6 }}
                        >
                          <Menu.Trigger asChild>
                            <Box display="inline-block" maxW="min(320px, 88vw)">
                              <StkMenuTrigger maxW="min(320px, 88vw)">
                                Hasara ata…
                              </StkMenuTrigger>
                            </Box>
                          </Menu.Trigger>
                          <Menu.Positioner>
                            <Menu.Content
                              minW="280px"
                              maxW="min(400px, 94vw)"
                              maxH="280px"
                              overflowY="auto"
                              py={1}
                              px={1}
                              {...stkMenuPanel}
                            >
                              {damages.map((d) => (
                                <Menu.Item
                                  key={d.id}
                                  value={d.id}
                                  cursor="pointer"
                                  color="whiteAlpha.900"
                                  borderRadius="md"
                                  py={2}
                                  px={2}
                                  fontSize="xs"
                                  whiteSpace="normal"
                                  wordBreak="break-word"
                                  _hover={{
                                    bg: "rgba(255,255,255,0.08)",
                                  }}
                                  onClick={() => void handleAssign(t.id, d.id)}
                                >
                                  {damageLabel(d)}
                                </Menu.Item>
                              ))}
                            </Menu.Content>
                          </Menu.Positioner>
                        </Menu.Root>
                      )}
                    </Flex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teams.length === 0 && (
            <Text fontSize="sm" color="whiteAlpha.500" py={4}>
              Henüz ekip oluşturulmamış.
            </Text>
          )}
        </Box>
      </StkGlassCard>

      {/* Gönüllüler tablosu */}
      <StkGlassCard mb={6}>
        <Flex align="center" gap={2} mb={1}>
          <Users size={16} color="#94a3b8" />
          <Text fontWeight="700" color="white">
            Gönüllüler
          </Text>
        </Flex>
        <Text fontSize="xs" color="whiteAlpha.500" mb={4}>
          Sisteme kayıtlı gönüllülerin güncel durumu ve ekip atamaları.
        </Text>
        <Box overflowX="auto">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.88)",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                {["#", "Beceriler", "Durum", "Müsait", "Ekip", "İşlem"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "7px 10px 7px 0",
                        color: "rgba(255,255,255,0.45)",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v, i) => (
                <tr
                  key={v.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <td
                    style={{
                      padding: "8px 10px 8px 0",
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td style={{ padding: "8px 10px 8px 0" }}>
                    {v.skills.length > 0 ? (
                      v.skills.join(", ")
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.35)" }}>
                        Belirtilmemiş
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "8px 10px 8px 0" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 9px",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        background:
                          v.status === "active"
                            ? "rgba(34,197,94,0.15)"
                            : v.status === "on_mission"
                              ? "rgba(251,191,36,0.15)"
                              : "rgba(148,163,184,0.12)",
                        color:
                          v.status === "active"
                            ? "#4ade80"
                            : v.status === "on_mission"
                              ? "#fbbf24"
                              : "#94a3b8",
                      }}
                    >
                      {VOLUNTEER_STATUS_LABEL[v.status] ?? v.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px 10px 8px 0" }}>
                    <span
                      style={{
                        color: v.is_available ? "#4ade80" : "#f87171",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {v.is_available ? "Evet" : "Hayır"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "8px 10px 8px 0",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {teamNameById(v.team_id)}
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    {v.team_id ? (
                      <button
                        type="button"
                        onClick={() =>
                          void handleVolunteerLeaveTeam(
                            v.id,
                            v.team_id as string,
                          )
                        }
                        style={{
                          padding: "4px 10px",
                          fontSize: "0.72rem",
                          borderRadius: 6,
                          border: "1px solid rgba(248,113,113,0.35)",
                          background: "rgba(248,113,113,0.08)",
                          color: "#fca5a5",
                          cursor: "pointer",
                        }}
                      >
                        Ekipten çıkar
                      </button>
                    ) : (
                      <select
                        className="auth-input"
                        style={{
                          maxWidth: 200,
                          padding: "6px 10px",
                          fontSize: "0.78rem",
                        }}
                        defaultValue=""
                        onChange={(e) => {
                          const tid = e.target.value;
                          e.target.selectedIndex = 0;
                          if (tid) void handleVolunteerJoinTeam(v.id, tid);
                        }}
                      >
                        <option value="">Ekibe ata…</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {volunteers.length === 0 && (
            <Text fontSize="sm" color="whiteAlpha.500" py={4}>
              Gönüllü kaydı bulunmuyor.
            </Text>
          )}
        </Box>
      </StkGlassCard>

      {/* Rota hesapla */}
      <StkGlassCard>
        <Flex align="center" gap={2} mb={1}>
          <Navigation size={16} color="#94a3b8" />
          <Text fontWeight="700" color="white">
            Rota Hesapla
          </Text>
        </Flex>
        <Text fontSize="xs" color="whiteAlpha.500" mb={4}>
          İki nokta arasındaki tahmini mesafeyi ve süreyi hesaplayın.
          Koordinatları ondalıklı derece (DD) formatında girin.
        </Text>
        <Grid
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
          gap={3}
          maxW="560px"
        >
          <input
            className="auth-input"
            placeholder="Başlangıç enlemi (lat)"
            value={routeStartLat}
            onChange={(e) => setRouteStartLat(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Başlangıç boylamı (lng)"
            value={routeStartLng}
            onChange={(e) => setRouteStartLng(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Bitiş enlemi (lat)"
            value={routeEndLat}
            onChange={(e) => setRouteEndLat(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Bitiş boylamı (lng)"
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
            {routeLoading ? "Hesaplanıyor…" : "Rotayı Hesapla"}
          </button>
          {routeResult && (
            <Text
              fontSize="sm"
              color={routeResult.includes("km") ? "green.300" : "red.300"}
            >
              {routeResult}
            </Text>
          )}
        </Flex>
      </StkGlassCard>
    </StkPageShell>
  );
};

export default StkCoordinationPage;
