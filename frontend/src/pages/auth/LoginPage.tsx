import React, { useState } from 'react';
import { Box, Button, Input, VStack, Text, Flex, Icon } from '@chakra-ui/react';
import { Shield, Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../core/supabase';

/* ── Animation variants ───────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden:  { y: 24, opacity: 0 },
  visible: { y: 0,  opacity: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
};

const LoginPage = () => {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { setError('E-posta ve şifre zorunludur.'); return; }
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError('E-posta veya şifre hatalı.'); }
    else           { navigate('/'); }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
      className="cmd-bg"
    >
      {/* ── Background decorations ────────────────────────────────── */}
      {/* Top-right glow */}
      <Box
        position="absolute"
        top="-120px"
        right="-80px"
        w="420px"
        h="420px"
        bg="rgba(229,62,62,0.08)"
        borderRadius="full"
        filter="blur(90px)"
        pointerEvents="none"
      />
      {/* Bottom-left glow */}
      <Box
        position="absolute"
        bottom="-100px"
        left="-60px"
        w="340px"
        h="340px"
        bg="rgba(59,130,246,0.07)"
        borderRadius="full"
        filter="blur(80px)"
        pointerEvents="none"
      />

      {/* ── Card ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}
      >
        <Box
          borderRadius="24px"
          p={10}
          style={{
            background: 'rgba(13, 27, 53, 0.7)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(229,62,62,0.06)',
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo */}
            <motion.div variants={itemVariants}>
              <Flex direction="column" align="center" mb={8}>
                <motion.div
                  className="floating"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Box
                    w="68px"
                    h="68px"
                    borderRadius="18px"
                    bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={4}
                    boxShadow="0 0 30px rgba(229,62,62,0.45), 0 0 60px rgba(229,62,62,0.15)"
                    className="glow-red"
                  >
                    <Icon color="white" style={{ width: 34, height: 34 }}>
                      <Shield />
                    </Icon>
                  </Box>
                </motion.div>

                <Text
                  fontSize="2xl"
                  fontWeight="900"
                  color="white"
                  letterSpacing="widest"
                  className="shimmer-text"
                >
                  AIDEP
                </Text>
                <Text color="whiteAlpha.500" fontSize="xs" mt={1} letterSpacing="wider">
                  AFET YÖNETİM SİSTEMİ
                </Text>
                <Text color="whiteAlpha.500" fontSize="sm" mt={3} textAlign="center">
                  Sisteme girmek için kimliğinizi doğrulayın.
                </Text>
              </Flex>
            </motion.div>

            {/* Form */}
            <VStack gap={4} onKeyDown={handleKeyDown}>
              {/* Email */}
              <motion.div variants={itemVariants} style={{ width: '100%' }}>
                <Box w="100%" position="relative">
                  <Box
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="whiteAlpha.400"
                    pointerEvents="none"
                    zIndex={1}
                    display="flex"
                    alignItems="center"
                  >
                    <Mail size={15} />
                  </Box>
                  <Input
                    pl={9}
                    placeholder="E-posta"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    borderRadius="12px"
                    h="46px"
                    fontSize="sm"
                    color="white"
                    bg="rgba(255,255,255,0.05)"
                    border="1px solid rgba(255,255,255,0.1)"
                    _placeholder={{ color: 'whiteAlpha.400' }}
                    _focus={{
                      borderColor: 'rgba(229,62,62,0.6)',
                      boxShadow: '0 0 0 3px rgba(229,62,62,0.15)',
                      bg: 'rgba(255,255,255,0.07)',
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                  />
                </Box>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} style={{ width: '100%' }}>
                <Box w="100%" position="relative">
                  <Box
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="whiteAlpha.400"
                    pointerEvents="none"
                    zIndex={1}
                    display="flex"
                    alignItems="center"
                  >
                    <Lock size={15} />
                  </Box>
                  <Input
                    pl={9}
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    borderRadius="12px"
                    h="46px"
                    fontSize="sm"
                    color="white"
                    bg="rgba(255,255,255,0.05)"
                    border="1px solid rgba(255,255,255,0.1)"
                    _placeholder={{ color: 'whiteAlpha.400' }}
                    _focus={{
                      borderColor: 'rgba(229,62,62,0.6)',
                      boxShadow: '0 0 0 3px rgba(229,62,62,0.15)',
                      bg: 'rgba(255,255,255,0.07)',
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                  />
                </Box>
              </motion.div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ width: '100%' }}
                >
                  <Box
                    px={4}
                    py={3}
                    borderRadius="10px"
                    bg="rgba(229,62,62,0.12)"
                    border="1px solid rgba(229,62,62,0.25)"
                  >
                    <Text color="#ff7777" fontSize="sm" fontWeight="500">
                      {error}
                    </Text>
                  </Box>
                </motion.div>
              )}

              {/* Submit */}
              <motion.div
                variants={itemVariants}
                style={{ width: '100%' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  w="100%"
                  h="46px"
                  borderRadius="12px"
                  fontWeight="700"
                  fontSize="sm"
                  letterSpacing="wide"
                  loading={isLoading}
                  onClick={handleLogin}
                  style={{
                    background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                    boxShadow: '0 4px 20px rgba(229,62,62,0.4)',
                    color: 'white',
                    border: 'none',
                  }}
                  _hover={{
                    boxShadow: '0 6px 28px rgba(229,62,62,0.6)',
                  }}
                  _active={{ transform: 'scale(0.98)' }}
                  transition="all 0.2s"
                  gap={2}
                >
                  <LogIn size={16} />
                  Giriş Yap
                </Button>
              </motion.div>
            </VStack>

            {/* Alt linkler */}
            <motion.div variants={itemVariants}>
              <Flex justify="space-between" mt={6}>
                <Link to="/forgot-password">
                  <Text
                    color="whiteAlpha.500"
                    fontSize="xs"
                    _hover={{ color: '#ff7777' }}
                    transition="color 0.2s"
                  >
                    Şifremi Unuttum
                  </Text>
                </Link>
                <Link to="/register">
                  <Text
                    color="whiteAlpha.500"
                    fontSize="xs"
                    _hover={{ color: '#ff7777' }}
                    transition="color 0.2s"
                  >
                    Kayıt Ol (STK/AFAD)
                  </Text>
                </Link>
              </Flex>
            </motion.div>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
