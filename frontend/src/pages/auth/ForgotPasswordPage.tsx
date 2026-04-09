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
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../core/supabase';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('E-posta adresi zorunludur.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (authError) {
      setError('Bir hata oluştu, lütfen tekrar deneyin.');
    } else {
      setSent(true);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleReset();
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
          <Text fontSize="2xl" fontWeight="800" color="gray.900" letterSpacing="tight">
            Şifremi Unuttum
          </Text>
          <Text color="gray.500" fontSize="sm" mt={1} textAlign="center">
            {sent
              ? 'Sıfırlama bağlantısı e-postanıza gönderildi.'
              : 'Kayıtlı e-posta adresinizi girin, sıfırlama bağlantısı gönderelim.'}
          </Text>
        </Flex>

        {!sent ? (
          <VStack gap={4} onKeyDown={handleKeyDown}>
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
                placeholder="E-posta"
                type="email"
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

            {error && (
              <Text color="red.500" fontSize="sm" w="100%">
                {error}
              </Text>
            )}

            <Button
              w="100%"
              h="44px"
              bg="#e53e3e"
              color="white"
              borderRadius="lg"
              fontWeight="600"
              fontSize="sm"
              loading={isLoading}
              onClick={handleReset}
              _hover={{ bg: '#c53030', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(229,62,62,0.4)' }}
              _active={{ bg: '#9b2c2c', transform: 'translateY(0)' }}
              transition="all 0.2s"
            >
              Sıfırlama Bağlantısı Gönder
            </Button>
          </VStack>
        ) : (
          <Box textAlign="center">
            <Text color="green.500" fontSize="sm" mb={4}>
              Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
            </Text>
          </Box>
        )}

        <Flex justify="center" mt={6}>
          <Link to="/login">
            <Flex align="center" gap={1} color="gray.500" _hover={{ color: '#e53e3e' }}>
              <ArrowLeft size={14} />
              <Text fontSize="xs">Giriş sayfasına dön</Text>
            </Flex>
          </Link>
        </Flex>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
