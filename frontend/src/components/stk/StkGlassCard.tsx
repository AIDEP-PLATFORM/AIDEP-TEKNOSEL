import { Box, type BoxProps } from "@chakra-ui/react";
import type React from "react";

const StkGlassCard: React.FC<BoxProps> = ({ children, ...rest }) => (
  <Box
    borderRadius="xl"
    border="1px solid rgba(255,255,255,0.1)"
    bg="linear-gradient(155deg, rgba(32,44,62,0.58) 0%, rgba(26,35,50,0.52) 42%, rgba(22,30,43,0.5) 100%)"
    backdropFilter="blur(16px)"
    boxShadow="0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)"
    p={{ base: 4, md: 6 }}
    transition="border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.45s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.33, 1, 0.68, 1)"
    _hover={{
      borderColor: "rgba(255,255,255,0.14)",
      boxShadow:
        "0 12px 44px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)",
    }}
    {...rest}
  >
    {children}
  </Box>
);

export default StkGlassCard;
