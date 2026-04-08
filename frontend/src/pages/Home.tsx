import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box p={8}>
      <Heading>AIDEP Ana Sayfa (Home)</Heading>
      <Text mt={4}>Hoş geldin, {user?.email || 'Anonim'}. Geçerli Rol: {user?.role}</Text>
      
      <Button colorScheme="emergency" mt={4} onClick={handleLogout}>
        Çıkış Yap
      </Button>
    </Box>
  );
};

export default Home;
