import { Text } from "@chakra-ui/react";
import type React from "react";
import StkGlassCard from "../components/stk/StkGlassCard";
import StkPageShell from "../components/stk/StkPageShell";

/** Sadece admin — backend /exercises henüz boş */
const ExercisesPage: React.FC = () => (
  <StkPageShell
    title="Tatbikatlar"
    subtitle="Yönetici alanı. /exercises API tanımlandığında buraya bağlanacak."
  >
    <StkGlassCard p={6}>
      <Text color="whiteAlpha.800" fontSize="sm" lineHeight="tall">
        Tatbikat endpoint’leri şu an boş router. Operasyonel tatbikat akışı için
        backend’e route eklendikten sonra bu sayfa güncellenebilir.
      </Text>
    </StkGlassCard>
  </StkPageShell>
);

export default ExercisesPage;
