import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const Simulation = () => {
  return (
    <Box p={8}>
      <Heading color="warning.500">Simülasyon Ekranı</Heading>
      <Text mt={4}>Sadece ADMIN yetkisi olanlar bu ekranı görebilmeli!</Text>
    </Box>
  );
};

export default Simulation;
