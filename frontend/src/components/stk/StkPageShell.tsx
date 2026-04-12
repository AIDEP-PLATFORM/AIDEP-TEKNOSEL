import { Box, Heading, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type React from "react";

interface StkPageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * STK iç sayfaları için ortak başlık + cam panel alanı (MainLayout ile uyumlu).
 */
const StkPageShell: React.FC<StkPageShellProps> = ({
  title,
  subtitle,
  children,
}) => (
  <Box maxW="1200px" mx="auto">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <Heading
        as="h1"
        fontSize={{ base: "xl", md: "2xl" }}
        fontWeight="800"
        letterSpacing="tight"
        color="white"
        mb={1}
      >
        {title}
      </Heading>
      {subtitle && (
        <Text
          fontSize="sm"
          color="whiteAlpha.600"
          mb={6}
          maxW="640px"
          lineHeight="tall"
        >
          {subtitle}
        </Text>
      )}
      {children}
    </motion.div>
  </Box>
);

export default StkPageShell;
