import React from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Icon,
  IconButton,
  Separator,
} from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  Users,
  ShieldAlert,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Tooltip } from '../ui/tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Harita', path: '/map', icon: Map },
  { name: 'Talepler', path: '/requests', icon: ClipboardList },
  { name: 'Gönüllüler', path: '/volunteers', icon: Users },
  { name: 'Tatbikatlar', path: '/simulation', icon: ShieldAlert },
  { name: 'Raporlar', path: '/reports', icon: FileBarChart },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  return (
    <Box
      as="nav"
      w={isCollapsed ? '80px' : '260px'}
      h="100vh"
      bg="gray.900"
      color="white"
      position="relative"
      transition="width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      display="flex"
      flexDirection="column"
      shadow="xl"
      zIndex={20}
      flexShrink={0}
    >
      {/* Logo Area */}
      <Flex
        h="72px"
        alignItems="center"
        justifyContent={isCollapsed ? 'center' : 'flex-start'}
        px={isCollapsed ? 0 : 6}
        bg="gray.800"
        borderBottomWidth="1px"
        borderColor="gray.700"
        transition="all 0.3s"
        gap={3}
      >
        <Icon color="#e53e3e" fontSize="28px">
          <Shield />
        </Icon>
        {!isCollapsed && (
          <Text
            fontSize="2xl"
            fontWeight="bold"
            letterSpacing="tight"
            background="linear-gradient(to right, #ea2e2e, #d69e2e)"
            backgroundClip="text"
            color="transparent"
          >
            AIDEP
          </Text>
        )}
      </Flex>

      {/* Menu Area */}
      <VStack gap={2} align="stretch" mt={6} px={isCollapsed ? 2 : 4} flex="1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Tooltip
              key={item.path}
              content={isCollapsed ? item.name : ''}
              positioning={{ placement: 'right' }}
            >
              <Box>
                <NavLink to={item.path} style={{ textDecoration: 'none' }}>
                  <Flex
                    align="center"
                    py={3}
                    px={isCollapsed ? 0 : 4}
                    justifyContent={isCollapsed ? 'center' : 'flex-start'}
                    borderRadius="xl"
                    cursor="pointer"
                    bg={isActive ? 'gray.800' : 'transparent'}
                    color={isActive ? 'white' : 'gray.400'}
                    transition="all 0.2s"
                    position="relative"
                    _hover={{ bg: 'gray.800', color: 'white', transform: 'translateX(2px)' }}
                  >
                    {isActive && (
                      <Box
                        position="absolute"
                        left="-16px"
                        top="50%"
                        transform="translateY(-50%)"
                        w="4px"
                        h="20px"
                        bg="#e53e3e"
                        borderRightRadius="md"
                        boxShadow="0 0 10px #e53e3e"
                      />
                    )}
                    <Icon
                      fontSize="20px"
                      color={isActive ? '#ea2e2e' : 'gray.400'}
                    >
                      <item.icon />
                    </Icon>
                    {!isCollapsed && (
                      <Text ml={3} fontWeight={isActive ? '600' : '500'} fontSize="sm">
                        {item.name}
                      </Text>
                    )}
                  </Flex>
                </NavLink>
              </Box>
            </Tooltip>
          );
        })}
      </VStack>

      <Separator borderColor="gray.700" />

      {/* Collapse Toggle */}
      <Flex p={4} justifyContent={isCollapsed ? 'center' : 'flex-end'} bg="gray.900">
        <IconButton
          aria-label="Toggle Sidebar"
          onClick={onToggle}
          variant="ghost"
          color="gray.400"
          size="sm"
          borderRadius="full"
          _hover={{ bg: 'gray.800', color: 'white' }}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </IconButton>
      </Flex>
    </Box>
  );
};

export default Sidebar;
