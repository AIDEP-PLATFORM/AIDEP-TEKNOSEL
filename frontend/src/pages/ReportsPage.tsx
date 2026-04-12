import { Box, Flex, Text } from "@chakra-ui/react";
import type React from "react";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { fetchDamageReports } from "../api/aidepApi";
import StkGlassCard from "../components/stk/StkGlassCard";
import StkPageShell from "../components/stk/StkPageShell";
import type { DamageReport } from "../types/api";

function toCsv(rows: DamageReport[]): string {
  const header =
    "id,created_at,status,severity,lat,lng,damage_class,description\n";
  const lines = rows.map((r) =>
    [
      r.id,
      r.created_at,
      r.status,
      r.severity ?? "",
      r.lat ?? "",
      r.lng ?? "",
      (r.damage_class ?? "").split(",").join(" "),
      (r.description ?? "").replace(/[\n\r,]/g, " "),
    ].join(","),
  );
  return header + lines.join("\n");
}

const ReportsPage: React.FC = () => {
  const [items, setItems] = useState<DamageReport[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await fetchDamageReports({ limit: 500, skip: 0 });
        if (c) return;
        setItems(res.items);
        setTotal(res.total);
      } catch (e: unknown) {
        const d = (e as { response?: { data?: { detail?: string } } })?.response
          ?.data?.detail;
        if (!c)
          setError(
            typeof d === "string" ? d : "Rapor verisi alınamadı.",
          );
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const download = () => {
    const blob = new Blob([toCsv(items)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aidep-damage-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StkPageShell
      title="Raporlar"
      subtitle="GET /damage verisinin STK özeti ve dışa aktarma."
    >
      {error && (
        <Text color="red.300" fontSize="sm" mb={4}>
          {error}
        </Text>
      )}
      <StkGlassCard mb={4}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Text fontSize="sm" color="whiteAlpha.700">
            Liste: {items.length} / toplam {total}
          </Text>
          <button
            type="button"
            className="auth-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            disabled={items.length === 0}
            onClick={download}
          >
            <Download size={16} />
            CSV indir
          </button>
        </Flex>
      </StkGlassCard>
      <StkGlassCard>
        <Box overflowX="auto" fontSize="sm">
          <table
            style={{ width: "100%", borderCollapse: "collapse", color: "inherit" }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <th style={{ textAlign: "left", padding: 8 }}>ID</th>
                <th style={{ textAlign: "left", padding: 8 }}>Oluşturma</th>
                <th style={{ textAlign: "left", padding: 8 }}>Durum</th>
                <th style={{ textAlign: "left", padding: 8 }}>Sınıf</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <td
                    style={{
                      padding: 8,
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                    }}
                  >
                    {r.id.slice(0, 8)}…
                  </td>
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                    {new Date(r.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td style={{ padding: 8 }}>{r.status}</td>
                  <td style={{ padding: 8 }}>{r.damage_class ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </StkGlassCard>
    </StkPageShell>
  );
};

export default ReportsPage;
