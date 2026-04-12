import { Badge, Box, Flex, Grid, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  ClipboardList,
  Map as MapIcon,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  fetchDamageReports,
  fetchTeams,
  fetchVolunteers,
} from "../api/aidepApi";
import StkGlassCard from "../components/stk/StkGlassCard";
import { useAuthStore } from "../stores/authStore";

const QuickLink: React.FC<{
  to: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}> = ({ to, title, desc, icon }) => (
  <RouterLink to={to} style={{ textDecoration: "none" }}>
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
      <StkGlassCard
        p={5}
        cursor="pointer"
        transition="border-color 0.2s, box-shadow 0.2s"
        _hover={{
          borderColor: "rgba(229,62,62,0.35)",
          boxShadow: "0 12px 48px rgba(229,62,62,0.12)",
        }}
      >
        <Flex align="flex-start" gap={3}>
          <Box color="#ff5555">{icon}</Box>
          <Box>
            <Text fontSize="sm" fontWeight="700" color="white" mb={1}>
              {title}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.600" lineHeight="short">
              {desc}
            </Text>
          </Box>
        </Flex>
      </StkGlassCard>
    </motion.div>
  </RouterLink>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const org = user?.organization?.trim();
  const [damageTotal, setDamageTotal] = useState<number | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [volunteerCount, setVolunteerCount] = useState<number | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadErr(null);
      try {
        const [dmg, teams, vols] = await Promise.all([
          fetchDamageReports({ limit: 1, skip: 0 }),
          fetchTeams().catch(() => []),
          fetchVolunteers().catch(() => []),
        ]);
        if (cancelled) return;
        setDamageTotal(dmg.total);
        setTeamCount(teams.length);
        setVolunteerCount(vols.length);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? "Özet yüklenemedi (oturum veya yetki kontrolü).";
        if (!cancelled) setLoadErr(typeof msg === "string" ? msg : String(msg));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box maxW="1200px" mx="auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Flex
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
          gap={4}
          mb={8}
          direction={{ base: "column", md: "row" }}
        >
          <Box>
            <Badge
              mb={2}
              bg="rgba(229,62,62,0.12)"
              color="#fca5a5"
              border="1px solid rgba(229,62,62,0.22)"
              fontSize="10px"
              letterSpacing="wider"
            >
              STK PANELİ
            </Badge>
            <Text
              as="h1"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="800"
              color="white"
              letterSpacing="tight"
            >
              Hoş geldiniz
              {user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.600" mt={2} maxW="560px">
              {org
                ? `${org} — afet koordinasyonunda kurumunuzun operasyonel görünümü.`
                : "Kurum bilgilerinizi tamamlayarak panele başlayın."}
            </Text>
            {loadErr && (
              <Text fontSize="xs" color="red.300" mt={2}>
                {loadErr}
              </Text>
            )}
          </Box>
        </Flex>

        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={4}
          mb={8}
        >
          <StkGlassCard p={5}>
            <Flex justify="space-between" align="flex-start" mb={2}>
              <Text
                fontSize="10px"
                color="whiteAlpha.500"
                letterSpacing="wider"
                fontWeight="700"
              >
                HASAR RAPORLARI
              </Text>
              <Activity size={18} color="#ff5555" />
            </Flex>
            <Text fontSize="2xl" fontWeight="800" color="white">
              {damageTotal === null ? "—" : damageTotal}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
              Toplam kayıtlı rapor
            </Text>
          </StkGlassCard>
          <StkGlassCard p={5}>
            <Flex justify="space-between" align="flex-start" mb={2}>
              <Text
                fontSize="10px"
                color="whiteAlpha.500"
                letterSpacing="wider"
                fontWeight="700"
              >
                EKİPLER
              </Text>
              <ClipboardList size={18} color="#ff5555" />
            </Flex>
            <Text fontSize="2xl" fontWeight="800" color="white">
              {teamCount === null ? "—" : teamCount}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
              Tanımlı ekip sayısı
            </Text>
          </StkGlassCard>
          <StkGlassCard p={5}>
            <Flex justify="space-between" align="flex-start" mb={2}>
              <Text
                fontSize="10px"
                color="whiteAlpha.500"
                letterSpacing="wider"
                fontWeight="700"
              >
                GÖNÜLLÜLER
              </Text>
              <MapIcon size={18} color="#ff5555" />
            </Flex>
            <Text fontSize="2xl" fontWeight="800" color="white">
              {volunteerCount === null ? "—" : volunteerCount}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
              Sistemdeki gönüllü kayıtları
            </Text>
          </StkGlassCard>
        </Grid>

        <Text
          fontSize="xs"
          fontWeight="700"
          color="whiteAlpha.500"
          letterSpacing="widest"
          mb={3}
        >
          HIZLI ERİŞİM
        </Text>
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4}>
          <QuickLink
            to="/organization"
            title="Kurum bilgileri"
            desc="STK adı, yetkili ve iletişim özeti."
            icon={<Building2 size={22} />}
          />
          <QuickLink
            to="/coordination"
            title="Koordinasyon özeti"
            desc="Ekipler, gönüllüler ve rota aracı."
            icon={<Activity size={22} />}
          />
        </Grid>
      </motion.div>
    </Box>
  );
}
