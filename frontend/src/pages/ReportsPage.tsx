import { Box, Flex, Text } from "@chakra-ui/react";
import { Download, FileText } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import damageService from "../services/damage.service";
import StkGlassCard from "../components/stk/StkGlassCard";
import StkPageShell from "../components/stk/StkPageShell";
import type { DamageReport } from "../types/api";

const STATUS_LABEL: Record<string, string> = {
  pending: "Beklemede",
  in_progress: "İşlemde",
  resolved: "Çözüldü",
  rejected: "Reddedildi",
};

const SEV_COLOR: Record<number, string> = {
  1: "#22c55e",
  2: "#86efac",
  3: "#fbbf24",
  4: "#f97316",
  5: "#ef4444",
};

function toCsv(rows: DamageReport[]): string {
  const header = "tarih,durum,hasar_turu,siddet,enlem,boylam,aciklama\n";
  const lines = rows.map((r) =>
    [
      new Date(r.created_at).toLocaleString("tr-TR"),
      STATUS_LABEL[r.status] ?? r.status,
      r.damage_class ?? "",
      r.severity ?? "",
      r.lat ?? "",
      r.lng ?? "",
      (r.description ?? "").replace(/[\n\r,]/g, " "),
    ].join(","),
  );
  return header + lines.join("\n");
}

const ReportsPage: React.FC = () => {
  const [items, setItems] = useState<DamageReport[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      try {
        const res = await damageService.fetchAll({ limit: 500, skip: 0 });
        if (c) return;
        setItems(res.items);
        setTotal(res.total);
      } catch (e: unknown) {
        const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        if (!c) setError(typeof d === "string" ? d : "Rapor verisi alınamadı.");
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => { c = true; };
  }, []);

  const download = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aidep-hasar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter === "all" ? items : items.filter((r) => r.status === filter);

  const statusCounts = items.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <StkPageShell
      title="Raporlar"
      subtitle="Sisteme kayıtlı tüm hasar raporlarının özeti. Filtreleyin veya CSV olarak dışa aktarın."
    >
      {error && (
        <Text color="red.300" fontSize="sm" mb={4}>{error}</Text>
      )}

      {/* Üst çubuk */}
      <StkGlassCard mb={4}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Flex align="center" gap={4} flexWrap="wrap">
            <Flex align="center" gap={2}>
              <FileText size={15} color="#94a3b8" />
              <Text fontSize="sm" color="whiteAlpha.700">
                {loading ? "Yükleniyor…" : `${filtered.length} rapor gösteriliyor`}
                {!loading && filter === "all" && total > items.length && (
                  <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>
                    (toplam {total})
                  </span>
                )}
              </Text>
            </Flex>

            {/* Durum filtresi */}
            <select
              className="auth-input"
              style={{ padding: "5px 10px", fontSize: "0.8rem", maxWidth: 180 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tüm durumlar</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v} ({statusCounts[k] ?? 0})
                </option>
              ))}
            </select>
          </Flex>

          <button
            type="button"
            className="auth-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            disabled={filtered.length === 0}
            onClick={download}
          >
            <Download size={15} />
            CSV İndir
          </button>
        </Flex>
      </StkGlassCard>

      {/* Tablo */}
      <StkGlassCard>
        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem", color: "rgba(255,255,255,0.88)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                {["#", "Tarih", "Hasar Türü", "Durum", "Şiddet", "Konum", "Açıklama"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "7px 10px 7px 0", color: "rgba(255,255,255,0.45)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "8px 10px 8px 0", color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: "8px 10px 8px 0", whiteSpace: "nowrap", color: "rgba(255,255,255,0.65)" }}>
                    {new Date(r.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td style={{ padding: "8px 10px 8px 0", fontWeight: 500 }}>
                    {r.damage_class ?? <span style={{ color: "rgba(255,255,255,0.3)" }}>Bilinmiyor</span>}
                  </td>
                  <td style={{ padding: "8px 10px 8px 0" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      background:
                        r.status === "resolved" ? "rgba(34,197,94,0.15)"
                        : r.status === "in_progress" ? "rgba(251,191,36,0.15)"
                        : r.status === "rejected" ? "rgba(239,68,68,0.12)"
                        : "rgba(148,163,184,0.12)",
                      color:
                        r.status === "resolved" ? "#4ade80"
                        : r.status === "in_progress" ? "#fbbf24"
                        : r.status === "rejected" ? "#f87171"
                        : "#94a3b8",
                    }}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px 10px 8px 0" }}>
                    {r.severity != null ? (
                      <span style={{
                        display: "inline-block",
                        background: SEV_COLOR[r.severity] ?? "#f97316",
                        color: "#000",
                        borderRadius: 4,
                        padding: "1px 7px",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}>
                        {r.severity}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "8px 10px 8px 0", fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
                    {r.lat != null && r.lng != null
                      ? `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`
                      : "—"}
                  </td>
                  <td style={{ padding: "8px 0", maxWidth: 200, color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>
                    {r.description
                      ? r.description.length > 60
                        ? r.description.slice(0, 60) + "…"
                        : r.description
                      : <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {!loading && filtered.length === 0 && !error && (
          <Text color="whiteAlpha.500" py={6} fontSize="sm" textAlign="center">
            {filter === "all" ? "Henüz hasar raporu yok." : "Bu durumda rapor bulunamadı."}
          </Text>
        )}
      </StkGlassCard>
    </StkPageShell>
  );
};

export default ReportsPage;
