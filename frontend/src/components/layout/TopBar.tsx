import React, { useState } from 'react';
import {
  Flex,
  Box,
  Text,
  IconButton,
  HStack,
  Avatar,
  Badge,
  Menu,
} from '@chakra-ui/react';
import { ChevronRight, Bell, User, LogOut, Settings } from 'lucide-react';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const routeNames: Record<string, string> = {
  '': 'Dashboard',
  'map': 'Canlı Harita',
  'requests': 'Talepler',
  'volunteers': 'Gönüllüler',
  'simulation': 'Tatbikatlar',
  'reports': 'Raporlar',
};

const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [unreadNotifications] = useState(3);

  // TODO: WEB-007 (WebSocket hook bağlandığında buraya entegre edilecek)
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
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
      shadow="sm"
      position="sticky"
      top={0}
      zIndex={10}
      flexShrink={0}
      _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
    >
      {/* Breadcrumb */}
      <HStack gap={2} align="center">
        <RouterLink to="/" style={{ textDecoration: 'none' }}>
          <Text fontSize="sm" fontWeight="500" color="gray.600" _hover={{ color: '#e53e3e' }} _dark={{ color: 'gray.400' }}>
            Ana Sayfa
          </Text>
        </RouterLink>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const title = routeNames[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <HStack key={to} gap={2}>
              <ChevronRight size={14} color="gray" />
              {last ? (
                <Text fontSize="sm" fontWeight="600" color="gray.900" _dark={{ color: 'white' }}>
                  {title}
                </Text>
              ) : (
                <RouterLink to={to} style={{ textDecoration: 'none' }}>
                  <Text fontSize="sm" fontWeight="500" color="gray.600" _hover={{ color: '#e53e3e' }}>
                    {title}
                  </Text>
                </RouterLink>
              )}
            </HStack>
          );
        })}
      </HStack>

      {/* Right Side */}
      <HStack gap={4}>

        {/* Connection Status */}
        <Flex
          alignItems="center"
          bg={isConnected ? '#e5f6eb' : '#ffe5e5'}
          px={3}
          py={1.5}
          borderRadius="full"
          gap={2}
          display={{ base: 'none', sm: 'flex' }}
        >
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg={isConnected ? '#38a169' : '#e53e3e'}
            boxShadow={isConnected ? '0 0 8px #38a169' : '0 0 8px #e53e3e'}
          />
          <Text fontSize="xs" fontWeight="bold" color={isConnected ? '#2b7d51' : '#b42727'}>
            {isConnected ? 'CANLI' : 'BAĞLANTI YOK'}
          </Text>
        </Flex>

        {/* Notifications */}
        <Box position="relative">
          <IconButton
            aria-label="Bildirimler"
            variant="ghost"
            color="gray.600"
            borderRadius="full"
            _hover={{ bg: 'gray.100', color: '#e53e3e' }}
            _dark={{ color: 'gray.300', _hover: { bg: 'gray.700' } }}
          >
            <Bell size={20} />
          </IconButton>
          {unreadNotifications > 0 && (
            <Badge
              position="absolute"
              top={0}
              right={0}
              bg="#e53e3e"
              color="white"
              borderRadius="full"
              fontSize="0.6em"
              px={1.5}
              transform="translate(25%, -25%)"
              border="2px solid white"
              minW="18px"
              textAlign="center"
            >
              {unreadNotifications}
            </Badge>
          )}
        </Box>

        {/* User Menu */}
        <Menu.Root>
          <Menu.Trigger asChild>
            <Flex
              align="center"
              cursor="pointer"
              borderRadius="full"
              p={1}
              gap={2}
              _hover={{ bg: 'gray.100' }}
              _dark={{ _hover: { bg: 'gray.700' } }}
              transition="background 0.2s"
            >
              <Avatar.Root size="sm" bg="#4299e1" color="white">
                <Avatar.Fallback>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar.Fallback>
              </Avatar.Root>
              <Box display={{ base: 'none', md: 'block' }} textAlign="left">
                <Text fontSize="sm" fontWeight="bold" lineHeight="1" color="gray.800" _dark={{ color: 'white' }}>
                  {user?.email || 'Kullanıcı'}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  {user?.role?.toUpperCase() || 'Misafir'}
                </Text>
              </Box>
            </Flex>
          </Menu.Trigger>

          <Menu.Positioner>
            <Menu.Content bg="white" shadow="lg" borderRadius="lg" minW="200px" border="none" _dark={{ bg: 'gray.800' }}>
              <Menu.Item value="profil" cursor="pointer" _hover={{ bg: 'gray.50' }} _dark={{ _hover: { bg: 'gray.700' } }}>
                <HStack gap={2}>
                  <User size={16} />
                  <Text fontSize="sm" fontWeight="500">Profil</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item value="ayarlar" cursor="pointer" _hover={{ bg: 'gray.50' }} _dark={{ _hover: { bg: 'gray.700' } }}>
                <HStack gap={2}>
                  <Settings size={16} />
                  <Text fontSize="sm" fontWeight="500">Ayarlar</Text>
                </HStack>
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item
                value="cikis"
                cursor="pointer"
                color="#e53e3e"
                onClick={handleLogout}
                _hover={{ bg: '#ffe5e5' }}
                _dark={{ _hover: { bg: 'whiteAlpha.100' } }}
              >
                <HStack gap={2}>
                  <LogOut size={16} />
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
