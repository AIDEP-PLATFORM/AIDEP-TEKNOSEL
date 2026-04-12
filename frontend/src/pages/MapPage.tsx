import { Box, Flex, Link, Text } from "@chakra-ui/react";
import type React from "react";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { fetchDamageReports } from "../api/aidepApi";
import StkGlassCard from "../components/stk/StkGlassCard";
import StkPageShell from "../components/stk/StkPageShell";
import type { DamageReport } from "../types/api";

const MapPage: React.FC = () => {
  const [items, setItems] = useState<DamageReport[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchDamageReports({ limit: 100, skip: 0 });
        if (c) return;
        setItems(res.items);
        setTotal(res.total);
      } catch (e: unknown) {
        const d = (e as { response?: { data?: { detail?: string } } })?.response
          ?.data?.detail;
        if (!c)
          setError(
            typeof d === "string" ? d : "Hasar listesi alınamadı.",
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const mapsUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <StkPageShell
      title="Harita verisi"
      subtitle="GET /damage — koordinatlı hasar raporları. Harita kutusu ileride Leaflet ile eklenecek; şimdilik liste ve harici bağlantı."
    >
      <StkGlassCard>
        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
          <Text fontSize="sm" color="whiteAlpha.600">
            Toplam: {loading ? "…" : total}
          </Text>
        </Flex>
        {error && (
          <Text color="red.300" fontSize="sm" mb={3}>
            {error}
          </Text>
        )}
        <Box overflowX="auto">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <th style={{ textAlign: "left", padding: "8px 8px 8px 0" }}>
                  Tarih
                </th>
                <th style={{ textAlign: "left", padding: "8px 8px 8px 0" }}>
                  Durum
                </th>
                <th style={{ textAlign: "left", padding: "8px 8px 8px 0" }}>
                  Şiddet
                </th>
                <th style={{ textAlign: "left", padding: "8px 8px 8px 0" }}>
                  Konum
                </th>
                <th style={{ textAlign: "left", padding: "8px 0" }}>Harita</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <td style={{ padding: "8px 8px 8px 0", whiteSpace: "nowrap" }}>
                    {new Date(r.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td style={{ padding: "8px 8px 8px 0" }}>{r.status}</td>
                  <td style={{ padding: "8px 8px 8px 0" }}>
                    {r.severity ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "8px 8px 8px 0",
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                    }}
                  >
                    {r.lat != null && r.lng != null
                      ? `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`
                      : "—"}
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    {r.lat != null && r.lng != null ? (
                      <Link
                        href={mapsUrl(r.lat, r.lng)}
                        target="_blank"
                        rel="noreferrer"
                        color="#ff5555"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                      >
                        Aç <ExternalLink size={14} />
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        {!loading && items.length === 0 && !error && (
          <Text color="whiteAlpha.500" py={6} fontSize="sm">
            Henüz hasar raporu yok.
          </Text>
        )}
      </StkGlassCard>
    </StkPageShell>
  );
};

export default MapPage;
