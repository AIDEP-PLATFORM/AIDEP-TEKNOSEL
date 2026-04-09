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
import { Shield, Mail, Lock, UserPlus, Building2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../core/supabase';
import type { Role } from '../../stores/authStore';

const ROLE_OPTIONS: { value: Extract<Role, 'stk' | 'afad'>; label: string }[] = [
  { value: 'stk', label: 'STK — Sivil Toplum Kuruluşu' },
  { value: 'afad', label: 'AFAD — Afet ve Acil Durum Yönetimi' },
];

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<'stk' | 'afad'>('stk');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(null);

    if (!email || !password || !organization) {
      setError('Tüm alanları doldurunuz.');
      return;
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setIsLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, organization },
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRegister();
  };

  if (success) {
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
          textAlign="center"
        >
          <Text fontSize="xl" fontWeight="700" color="gray.900" mb={3}>
            Kayıt Talebiniz Alındı
          </Text>
          <Text color="gray.500" fontSize="sm" mb={6}>
            E-posta adresinize doğrulama bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol edin.
          </Text>
          <Button
            bg="#e53e3e"
            color="white"
            borderRadius="lg"
            fontWeight="600"
            fontSize="sm"
            onClick={() => navigate('/login')}
            _hover={{ bg: '#c53030' }}
          >
            Giriş Sayfasına Dön
          </Button>
        </Box>
      </Box>
    );
  }

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
        maxW="440px"
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
            Yetkili Kayıt
          </Text>
          <Text color="gray.500" fontSize="sm" mt={1} textAlign="center">
            STK veya AFAD yetkilisi olarak sisteme kayıt olun.
          </Text>
        </Flex>

        <VStack gap={4} onKeyDown={handleKeyDown}>
          {/* Rol seçimi */}
          <Flex w="100%" gap={2}>
            {ROLE_OPTIONS.map((opt) => (
              <Box
                key={opt.value}
                flex={1}
                p={3}
                borderRadius="lg"
                border="2px solid"
                borderColor={role === opt.value ? '#e53e3e' : 'gray.200'}
                bg={role === opt.value ? '#fff5f5' : 'white'}
                cursor="pointer"
                onClick={() => setRole(opt.value)}
                textAlign="center"
                transition="all 0.15s"
              >
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color={role === opt.value ? '#e53e3e' : 'gray.500'}
                >
                  {opt.value.toUpperCase()}
                </Text>
                <Text fontSize="10px" color="gray.400" mt={0.5}>
                  {opt.label.split('—')[1]?.trim()}
                </Text>
              </Box>
            ))}
          </Flex>

          {/* Kurum adı */}
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
              <Building2 size={16} />
            </Box>
            <Input
              pl={9}
              placeholder="Kurum / Organizasyon adı"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
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
              placeholder="Şifre (en az 8 karakter)"
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

          {/* Password Confirm */}
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
              placeholder="Şifreyi onayla"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
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

          {/* Hata mesajı */}
          {error && (
            <Text color="red.500" fontSize="sm" w="100%">
              {error}
            </Text>
          )}

          {/* Submit */}
          <Button
            w="100%"
            h="44px"
            bg="#e53e3e"
            color="white"
            borderRadius="lg"
            fontWeight="600"
            fontSize="sm"
            loading={isLoading}
            onClick={handleRegister}
            _hover={{ bg: '#c53030', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(229,62,62,0.4)' }}
            _active={{ bg: '#9b2c2c', transform: 'translateY(0)' }}
            transition="all 0.2s"
            gap={2}
          >
            <UserPlus size={16} />
            Kayıt Ol
          </Button>
        </VStack>

        <Flex justify="center" mt={6}>
          <Link to="/login">
            <Text color="gray.500" fontSize="xs" _hover={{ color: '#e53e3e' }}>
              Zaten hesabınız var mı? Giriş yapın
            </Text>
          </Link>
        </Flex>
      </Box>
    </Box>
  );
};

export default RegisterPage;
