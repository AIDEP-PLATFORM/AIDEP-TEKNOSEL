import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { Shield, Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleFakeLogin = async () => {
    setIsLoading(true);
    // Şimdilik fake login — ileride Firebase signInWithEmailAndPassword gelecek
    await new Promise((r) => setTimeout(r, 800));
    if (email === 'admin@aidep.com') {
      setAuth({ uid: '123', email, role: 'admin' }, 'fake-jwt-token-admin');
    } else {
      setAuth({ uid: '124', email, role: 'user' }, 'fake-jwt-token-user');
    }
    setIsLoading(false);
    navigate('/');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFakeLogin();
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      backgroundImage="radial-gradient(ellipse at top, #fee2e2 0%, #f9fafb 60%)"
    >
      <Box
        bg="white"
        shadow="xl"
        borderRadius="2xl"
        p={10}
        w="100%"
        maxW="420px"
        border="1px solid"
        borderColor="gray.100"
      >
        {/* Logo */}
        <Flex direction="column" align="center" mb={8}>
          <Flex
            w="64px"
            h="64px"
            bg="#e53e3e"
            borderRadius="xl"
            alignItems="center"
            justifyContent="center"
            mb={4}
            boxShadow="0 8px 24px rgba(229, 62, 62, 0.35)"
          >
            <Icon color="white" style={{ width: 32, height: 32 }}>
              <Shield />
            </Icon>
          </Flex>
          <Text
            fontSize="2xl"
            fontWeight="800"
            color="gray.900"
            letterSpacing="tight"
          >
            AIDEP Giriş
          </Text>
          <Text color="gray.500" fontSize="sm" mt={1} textAlign="center">
            Sisteme girmek için kimliğinizi doğrulayın.
          </Text>
        </Flex>

        {/* Form */}
        <VStack gap={4} onKeyDown={handleKeyDown}>
          {/* Email */}
          <Box w="100%" position="relative">
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
              pointerEvents="none"
              zIndex={1}
              display="flex"
              alignItems="center"
            >
              <Mail size={16} />
            </Box>
            <Input
              pl={9}
              placeholder="E-posta (örn: admin@aidep.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              borderRadius="lg"
              borderColor="gray.200"
              bg="white"
              color="gray.900"
              _placeholder={{ color: 'gray.400' }}
              _focus={{ borderColor: '#e53e3e', boxShadow: '0 0 0 1px #e53e3e', bg: 'white' }}
              _hover={{ borderColor: 'gray.300' }}
              h="44px"
              fontSize="sm"
            />
          </Box>

          {/* Password */}
          <Box w="100%" position="relative">
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
              pointerEvents="none"
              zIndex={1}
              display="flex"
              alignItems="center"
            >
              <Lock size={16} />
            </Box>
            <Input
              pl={9}
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              borderRadius="lg"
              borderColor="gray.200"
              bg="white"
              color="gray.900"
              _placeholder={{ color: 'gray.400' }}
              _focus={{ borderColor: '#e53e3e', boxShadow: '0 0 0 1px #e53e3e', bg: 'white' }}
              _hover={{ borderColor: 'gray.300' }}
              h="44px"
              fontSize="sm"
            />
          </Box>

          {/* Submit Button */}
          <Button
            w="100%"
            h="44px"
            bg="#e53e3e"
            color="white"
            borderRadius="lg"
            fontWeight="600"
            fontSize="sm"
            loading={isLoading}
            onClick={handleFakeLogin}
            _hover={{ bg: '#c53030', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(229,62,62,0.4)' }}
            _active={{ bg: '#9b2c2c', transform: 'translateY(0)' }}
            transition="all 0.2s"
            gap={2}
          >
            <LogIn size={16} />
            Giriş Yap
          </Button>
        </VStack>

        {/* Hint */}
        <Text color="gray.400" fontSize="xs" textAlign="center" mt={6}>
          Test: <strong>admin@aidep.com</strong> → Admin girişi
        </Text>
      </Box>
    </Box>
  );
};

export default Login;
