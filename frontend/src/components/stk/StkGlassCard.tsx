import { Box, type BoxProps } from "@chakra-ui/react";
import type React from "react";

const StkGlassCard: React.FC<BoxProps> = ({ children, ...rest }) => (
  <Box
    borderRadius="xl"
    border="1px solid rgba(255,255,255,0.08)"
    bg="rgba(13, 27, 53, 0.45)"
    backdropFilter="blur(16px)"
    boxShadow="0 8px 40px rgba(0,0,0,0.35)"
    p={{ base: 4, md: 6 }}
    {...rest}
  >
    {children}
  </Box>
);

export default StkGlassCard;
