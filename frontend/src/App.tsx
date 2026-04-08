import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

export default function App() {
  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <VStack spacing={6} p={8} bg="white" shadow="md" rounded="lg">
        <Heading color="emergency.500">AIDEP Sistem Testi</Heading>
        <Text color="gray.600">Bu bir Chakra UI uyarı testidir.</Text>
        <Button colorScheme="emergency" size="lg">
          Acil Durum Bildir (Emergency Color)
        </Button>
        <Button colorScheme="warning" variant="outline">
          Uyarı Rengi (Warning)
        </Button>
        <Button colorScheme="safe" variant="ghost">
          Güvenli (Safe Default)
        </Button>
      </VStack>
    </Box>
  );
}
