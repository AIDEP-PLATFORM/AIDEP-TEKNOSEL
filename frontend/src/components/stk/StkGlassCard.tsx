import { Box, type BoxProps } from "@chakra-ui/react";
import type React from "react";

const StkGlassCard: React.FC<BoxProps> = ({ children, ...rest }) => (
  <Box
    borderRadius="xl"
    border="1px solid rgba(255,255,255,0.1)"
    bg="linear-gradient(155deg, rgba(30,41,59,0.55) 0%, rgba(22,30,43,0.5) 100%)"
    backdropFilter="blur(16px)"
    boxShadow="0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)"
    p={{ base: 4, md: 6 }}
    {...rest}
  >
    {children}
  </Box>
);

export default StkGlassCard;
