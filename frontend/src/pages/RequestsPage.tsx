import { Text } from "@chakra-ui/react";
import type React from "react";
import StkGlassCard from "../components/stk/StkGlassCard";
import StkPageShell from "../components/stk/StkPageShell";

const RequestsPage: React.FC = () => (
  <StkPageShell
    title="Talepler"
    subtitle="Vatandaşlardan gelen yardım talepleri burada listelenecek. Bu modül henüz aktif değil."
  >
    <StkGlassCard p={6}>
      <Text color="whiteAlpha.800" fontSize="sm" lineHeight="tall">
        Yardım talep modülü şu an geliştirme aşamasındadır. Hasar kayıtlarını
        izlemek için <strong>Harita</strong> ve <strong>Raporlar</strong>,
        saha koordinasyonu için <strong>Koordinasyon</strong> sayfasını
        kullanabilirsiniz.
      </Text>
    </StkGlassCard>
  </StkPageShell>
);

export default RequestsPage;
