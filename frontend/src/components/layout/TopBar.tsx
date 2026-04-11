import React, { useState } from 'react';
import {
  Flex, Box, Text, IconButton, HStack, Avatar, Badge, Menu,
} from '@chakra-ui/react';
import { ChevronRight, Bell, User, LogOut, Settings } from 'lucide-react';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';

const routeNames: Record<string, string> = {
  '':           'Dashboard',
  'map':        'Canlı Harita',
  'requests':   'Talepler',
  'volunteers': 'Gönüllüler',
  'simulation': 'Tatbikatlar',
  'reports':    'Raporlar',
};

const TopBar: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuthStore();
  const [unreadNotifications] = useState(3);

  // TODO: WEB-007 – WebSocket hook entegre edilecek
  const isConnected = true;

  const pathnames = location.pathname.split('/').filter((x) => x);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Flex
      as="header"
      w="100%"
      h="72px"
      alignItems="center"
      justifyContent="space-between"
      px={6}
      position="sticky"
      top={0}
      zIndex={10}
      flexShrink={0}
      style={{
        background: 'rgba(6, 13, 31, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <HStack gap={2} align="center">
        <RouterLink to="/" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ color: '#ff5555' }}>
            <Text
              fontSize="sm"
              fontWeight="500"
              color="whiteAlpha.600"
              transition="color 0.2s"
              _hover={{ color: '#ff5555' }}
            >
              Ana Sayfa
            </Text>
          </motion.div>
        </RouterLink>

        {pathnames.map((value, index) => {
          const last  = index === pathnames.length - 1;
          const to    = `/${pathnames.slice(0, index + 1).join('/')}`;
          const title = routeNames[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <HStack key={to} gap={2}>
              <ChevronRight size={13} color="rgba(255,255,255,0.25)" />
              {last ? (
                <Text fontSize="sm" fontWeight="700" color="white">
                  {title}
                </Text>
              ) : (
                <RouterLink to={to} style={{ textDecoration: 'none' }}>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color="whiteAlpha.600"
                    _hover={{ color: '#ff5555' }}
                    transition="color 0.2s"
                  >
                    {title}
                  </Text>
                </RouterLink>
              )}
            </HStack>
          );
        })}
      </HStack>

      {/* ── Right Controls ──────────────────────────────────────────── */}
      <HStack gap={3}>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Flex
            alignItems="center"
            px={3}
            py="6px"
            borderRadius="full"
            gap={2}
            display={{ base: 'none', sm: 'flex' }}
            style={{
              background: isConnected ? 'rgba(16,185,129,0.1)' : 'rgba(229,62,62,0.1)',
              border: `1px solid ${isConnected ? 'rgba(16,185,129,0.25)' : 'rgba(229,62,62,0.25)'}`,
            }}
          >
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              flexShrink={0}
              bg={isConnected ? '#10b981' : '#e53e3e'}
              className={isConnected ? 'glow-green live-dot' : 'glow-red live-dot'}
            />
            <Text
              fontSize="11px"
              fontWeight="700"
              letterSpacing="wider"
              color={isConnected ? '#34d399' : '#ff7777'}
            >
              {isConnected ? 'CANLI' : 'BAĞLANTI YOK'}
            </Text>
          </Flex>
        </motion.div>

        {/* Notification Bell */}
        <Box position="relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            animate={unreadNotifications > 0 ? {
              rotate: [0, -10, 10, -8, 8, -4, 4, 0],
              transition: { delay: 1.5, duration: 0.6, repeat: Infinity, repeatDelay: 6 },
            } : {}}
          >
            <IconButton
              aria-label="Bildirimler"
              variant="ghost"
              borderRadius="full"
              color="whiteAlpha.600"
              _hover={{ bg: 'rgba(255,255,255,0.07)', color: 'white' }}
            >
              <Bell size={19} />
            </IconButton>
          </motion.div>

          {unreadNotifications > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.4 }}
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                pointerEvents: 'none',
              }}
            >
              <Badge
                bg="#e53e3e"
                color="white"
                borderRadius="full"
                fontSize="0.6em"
                px={1.5}
                border="2px solid rgba(6,13,31,0.9)"
                minW="17px"
                textAlign="center"
                boxShadow="0 0 8px rgba(229,62,62,0.6)"
              >
                {unreadNotifications}
              </Badge>
            </motion.div>
          )}
        </Box>

        {/* User Menu */}
        <Menu.Root>
          <Menu.Trigger asChild>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Flex
                align="center"
                cursor="pointer"
                borderRadius="full"
                p={1}
                pr={3}
                gap={2}
                border="1px solid rgba(255,255,255,0.08)"
                bg="rgba(255,255,255,0.04)"
                _hover={{ bg: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.14)' }}
                transition="all 0.2s"
              >
                <Avatar.Root
                  size="sm"
                  style={{
                    background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                    boxShadow: '0 0 12px rgba(229,62,62,0.4)',
                  }}
                  color="white"
                >
                  <Avatar.Fallback>
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </Avatar.Fallback>
                </Avatar.Root>
                <Box display={{ base: 'none', md: 'block' }} textAlign="left">
                  <Text fontSize="12px" fontWeight="700" lineHeight="1" color="white">
                    {user?.email?.split('@')[0] || 'Kullanıcı'}
                  </Text>
                  <Text fontSize="10px" color="whiteAlpha.500" mt="2px" letterSpacing="widest">
                    {user?.role?.toUpperCase() || 'MİSAFİR'}
                  </Text>
                </Box>
              </Flex>
            </motion.div>
          </Menu.Trigger>

          <Menu.Positioner>
            <Menu.Content
              minW="200px"
              borderRadius="14px"
              border="1px solid rgba(255,255,255,0.08)"
              style={{
                background: 'rgba(10, 20, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <Menu.Item
                value="profil"
                cursor="pointer"
                color="whiteAlpha.800"
                borderRadius="8px"
                _hover={{ bg: 'rgba(255,255,255,0.07)', color: 'white' }}
              >
                <HStack gap={2}>
                  <User size={15} />
                  <Text fontSize="sm" fontWeight="500">Profil</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item
                value="ayarlar"
                cursor="pointer"
                color="whiteAlpha.800"
                borderRadius="8px"
                _hover={{ bg: 'rgba(255,255,255,0.07)', color: 'white' }}
              >
                <HStack gap={2}>
                  <Settings size={15} />
                  <Text fontSize="sm" fontWeight="500">Ayarlar</Text>
                </HStack>
              </Menu.Item>
              <Menu.Separator borderColor="rgba(255,255,255,0.08)" />
              <Menu.Item
                value="cikis"
                cursor="pointer"
                color="#ff7777"
                borderRadius="8px"
                onClick={handleLogout}
                _hover={{ bg: 'rgba(229,62,62,0.12)' }}
              >
                <HStack gap={2}>
                  <LogOut size={15} />
                  <Text fontSize="sm" fontWeight="500">Çıkış Yap</Text>
                </HStack>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>

      </HStack>
    </Flex>
  );
};

export default TopBar;
