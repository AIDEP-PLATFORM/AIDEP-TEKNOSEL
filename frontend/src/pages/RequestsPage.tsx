import { Text } from "@chakra-ui/react";
import type React from "react";
import StkGlassCard from "../components/stk/StkGlassCard";
import StkPageShell from "../components/stk/StkPageShell";

/**
 * Backend'de /requests router'ı henüz boş; STK panelinde bilgilendirme.
 */
const RequestsPage: React.FC = () => (
  <StkPageShell
    title="Talepler"
    subtitle="Yardım talepleri API eklendiğinde bu sayfa /requests uçlarına bağlanacak."
  >
    <StkGlassCard p={6}>
      <Text color="whiteAlpha.800" fontSize="sm" lineHeight="tall">
        Şu an FastAPI tarafında talep endpoint’leri tanımlı değil. Hasar
        raporları ve ekip atamaları için <strong>Harita</strong>,{" "}
        <strong>Koordinasyon</strong> ve <strong>Raporlar</strong> bölümlerini
        kullanın.
      </Text>
    </StkGlassCard>
  </StkPageShell>
);

export default RequestsPage;
