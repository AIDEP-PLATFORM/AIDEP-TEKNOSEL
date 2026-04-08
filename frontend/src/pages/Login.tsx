import React, { useState } from 'react';
import { Box, Button, Input, VStack, Heading, Text } from '@chakra-ui/react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleFakeLogin = () => {
    // Şimdilik sahte (fake) bir login simülasyonu yapıyoruz. 
    // İlerde buraya Firebase signInWithEmailAndPassword konacak.
    if (email === 'admin@aidep.com') {
      setAuth({ uid: '123', email, role: 'admin' }, 'fake-jwt-token-admin');
    } else {
      setAuth({ uid: '124', email, role: 'user' }, 'fake-jwt-token-user');
    }
    navigate('/');
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <VStack spacing={4} p={8} bg="white" shadow="md" rounded="lg" w="100%" maxW="md">
        <Heading size="md" color="emergency.500">AIDEP Giriş</Heading>
        <Text color="gray.500" fontSize="sm">Sisteme girmek için kimliğinizi doğrulayın.</Text>
        
        <Input 
          placeholder="E-posta (örn: admin@aidep.com)" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
          type="password" 
          placeholder="Şifre" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <Button colorScheme="safe" w="100%" onClick={handleFakeLogin}>
          Giriş Yap
        </Button>
      </VStack>
    </Box>
  );
};

export default Login;
