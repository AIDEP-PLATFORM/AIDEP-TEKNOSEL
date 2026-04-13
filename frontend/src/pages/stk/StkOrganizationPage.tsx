import { Badge, Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Building2, Mail, User } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import userService from "../../services/user.service";
import StkGlassCard from "../../components/stk/StkGlassCard";
import StkPageShell from "../../components/stk/StkPageShell";
import type { User as StoreUser } from "../../stores/authStore";
import { useAuthStore } from "../../stores/authStore";

const FieldRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <Flex
    align="flex-start"
    gap={3}
    py={3}
    borderBottom="1px solid rgba(255,255,255,0.06)"
  >
    <Box color="#ff5555" mt={0.5} flexShrink={0}>
      {icon}
    </Box>
    <Box flex="1" minW={0}>
      <Text
        fontSize="10px"
        color="whiteAlpha.500"
        letterSpacing="wider"
        textTransform="uppercase"
        mb={1}
      >
        {label}
      </Text>
      <Text fontSize="sm" color="white" fontWeight="500" wordBreak="break-word">
        {value || "—"}
      </Text>
    </Box>
  </Flex>
);

function mapApiUserToStore(raw: Record<string, unknown>): StoreUser {
  return {
    id: String(raw.id),
    email: String(raw.email),
    full_name: String(raw.full_name),
    phone: String(raw.phone),
    tc_no: String(raw.tc_no),
    city: raw.city != null ? String(raw.city) : undefined,
    role: raw.role as StoreUser["role"],
    organization:
      raw.organization != null ? String(raw.organization) : undefined,
    is_active:
      typeof raw.is_active === "boolean" ? raw.is_active : undefined,
    created_at:
      typeof raw.created_at === "string" ? raw.created_at : undefined,
  };
}

const StkOrganizationPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const org = user?.organization?.trim() || "Tanımlı kurum adı yok";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [organization, setOrganization] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name);
    setPhone(user.phone);
    setCity(user.city ?? "");
    setOrganization(user.organization ?? "");
  }, [user]);

  const handleSave = async () => {
    setError(null);
    setOk(false);
    setSaving(true);
    try {
      const raw = (await userService.patchProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        city: city.trim() || null,
        organization: organization.trim() || null,
      })) as Record<string, unknown>;
      setUser(mapApiUserToStore(raw));
      setOk(true);
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: unknown } } })?.response
        ?.data?.detail;
      setError(
        typeof d === "string" ? d : "Profil güncellenemedi.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <StkPageShell
      title="Kurum bilgileri"
      subtitle="Bilgileriniz /users/me üzerinden güncellenir; kaydettiğinizde oturumdaki profil de yenilenir."
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 320px" }}
        gap={6}
        alignItems="start"
      >
        <StkGlassCard>
          <Flex align="center" gap={3} mb={4}>
            <Flex
              w="48px"
              h="48px"
              borderRadius="xl"
              align="center"
              justify="center"
              bg="linear-gradient(135deg, rgba(229,62,62,0.25) 0%, rgba(197,48,48,0.15) 100%)"
              border="1px solid rgba(229,62,62,0.35)"
            >
              <Building2 size={22} color="#ff5555" />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="700" color="white">
                {org}
              </Text>
              <Badge
                mt={1}
                bg="rgba(229,62,62,0.15)"
                color="#fca5a5"
                border="1px solid rgba(229,62,62,0.25)"
                fontSize="10px"
                letterSpacing="wider"
              >
                STK YETKİLİSİ
              </Badge>
            </Box>
          </Flex>

          <FieldRow
            icon={<Mail size={18} />}
            label="E-posta (salt okunur)"
            value={user?.email ?? ""}
          />

          <Box py={3} borderBottom="1px solid rgba(255,255,255,0.06)">
            <Text
              fontSize="10px"
              color="whiteAlpha.500"
              letterSpacing="wider"
              mb={2}
            >
              AD SOYAD
            </Text>
            <input
              className="auth-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ad Soyad"
            />
          </Box>
          <Box py={3} borderBottom="1px solid rgba(255,255,255,0.06)">
            <Text
              fontSize="10px"
              color="whiteAlpha.500"
              letterSpacing="wider"
              mb={2}
            >
              TELEFON
            </Text>
            <input
              className="auth-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 ..."
            />
          </Box>
          <Box py={3} borderBottom="1px solid rgba(255,255,255,0.06)">
            <Text
              fontSize="10px"
              color="whiteAlpha.500"
              letterSpacing="wider"
              mb={2}
            >
              ŞEHİR
            </Text>
            <input
              className="auth-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="İl / ilçe"
            />
          </Box>
          <Box py={3} borderBottom="1px solid rgba(255,255,255,0.06)">
            <Text
              fontSize="10px"
              color="whiteAlpha.500"
              letterSpacing="wider"
              mb={2}
            >
              KURUM ADI
            </Text>
            <input
              className="auth-input"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="STK / kurum adı"
            />
          </Box>

          <FieldRow
            icon={<Mail size={18} />}
            label="TC kimlik (değiştirmek için API)"
            value={user?.tc_no ?? ""}
          />

          {error && (
            <Text color="red.300" fontSize="sm" mt={3}>
              {error}
            </Text>
          )}
          {ok && (
            <Text color="green.300" fontSize="sm" mt={3}>
              Kaydedildi.
            </Text>
          )}

          <Flex mt={4}>
            <button
              type="button"
              className="auth-btn"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
            </button>
          </Flex>
        </StkGlassCard>

        <StkGlassCard p={5}>
          <Text
            fontSize="xs"
            fontWeight="700"
            color="whiteAlpha.700"
            letterSpacing="widest"
            mb={3}
          >
            HIZLI NOT
          </Text>
          <Text fontSize="sm" color="whiteAlpha.600" lineHeight="tall">
            TC kimlik güvenlik gereği bu formdan düzenlenmez. E-posta değişikliği
            için yönetici ile iletişime geçin.
          </Text>
        </StkGlassCard>
      </Grid>
    </StkPageShell>
  );
};

export default StkOrganizationPage;
