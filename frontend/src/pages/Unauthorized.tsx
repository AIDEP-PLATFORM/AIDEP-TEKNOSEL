import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const Unauthorized = () => {
  return (
    <Box p={8} textAlign="center">
      <Heading color="emergency.500">403 - Yetkisiz Erişim</Heading>
      <Text mt={4}>Üzgünüz, bu sayfayı görüntülemek için yeterli yetkiye sahip değilsiniz.</Text>
    </Box>
  );
};

export default Unauthorized;
