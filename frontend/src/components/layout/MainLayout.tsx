import React, { useState, useEffect } from 'react';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/* ── Page transition variants ─────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.28, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(3px)',
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
};

const MainLayout: React.FC = () => {
  const isDesktop  = useBreakpointValue({ base: false, lg: true, md: false });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location   = useLocation();

  useEffect(() => {
    if (isDesktop !== undefined) {
      setIsCollapsed(!isDesktop);
    }
  }, [isDesktop]);

  return (
    <Flex
      h="100vh"
      w="100vw"
      overflow="hidden"
      className="cmd-bg"
    >
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content */}
      <Flex direction="column" flex="1" h="100%" overflow="hidden">
        <TopBar />

        {/* Page content with AnimatePresence for route transitions */}
        <Box flex="1" overflowY="auto" position="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                padding: '24px',
                minHeight: '100%',
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Flex>
    </Flex>
  );
};

export default MainLayout;
