import React, { useState, useEffect } from 'react';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout: React.FC = () => {
  // tablet icin gizli (collapsed), desktop icin acik olsun
  const isDesktop = useBreakpointValue({ base: false, lg: true, md: false });
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Ekran boyutu değiştiğinde varsayılan duruma geri dönsün
    if (isDesktop !== undefined) {
      setIsCollapsed(!isDesktop);
    }
  }, [isDesktop]);

  return (
    <Flex h="100vh" w="100vw" overflow="hidden" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      {/* Sidebar Component */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <Flex direction="column" flex="1" h="100%" overflow="hidden">
        {/* TopBar Component */}
        <TopBar />

        {/* Dynamic Page Content */}
        <Box flex="1" overflowY="auto" p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default MainLayout;
