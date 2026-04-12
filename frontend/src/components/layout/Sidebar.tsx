import { Box, Flex, Icon, IconButton, Separator, Text } from "@chakra-ui/react";
import { AnimatePresence, type Variants, motion } from "framer-motion";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Map as MapIcon,
  Radio,
  Shield,
  ShieldAlert,
} from "lucide-react";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { Tooltip } from "../ui/tooltip";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const baseNavItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Harita", path: "/map", icon: MapIcon },
  { name: "Talepler", path: "/requests", icon: ClipboardList },
  { name: "Kurum", path: "/organization", icon: Building2 },
  { name: "Koordinasyon", path: "/coordination", icon: Radio },
  { name: "Raporlar", path: "/reports", icon: FileBarChart },
] as const;

const adminOnlyNav = {
  name: "Tatbikatlar",
  path: "/simulation",
  icon: ShieldAlert,
} as const;

/* ── Framer Motion Variants ─────────────────────────────────────────── */
const listVariants: Variants = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  hidden: {},
};

const itemVariants: Variants = {
  hidden: { x: -16, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 320, damping: 26 },
  },
};

const logoTextVariants: Variants = {
  visible: { opacity: 1, x: 0, transition: { duration: 0.22 } },
  hidden: { opacity: 0, x: -12, transition: { duration: 0.15 } },
};

/* ── Component ──────────────────────────────────────────────────────── */
const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const navItems = React.useMemo(
    () =>
      user?.role === "admin"
        ? [...baseNavItems.slice(0, 5), adminOnlyNav, baseNavItems[5]]
        : [...baseNavItems],
    [user?.role],
  );

  return (
    <motion.nav
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      initial={false}
      style={{
        height: "100vh",
        background: "linear-gradient(180deg, #0d1b35 0%, #070e20 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        flexShrink: 0,
        zIndex: 20,
        overflow: "hidden",
      }}
    >
      {/* ── Decorative glow ─────────────────────────────────────────── */}
      <Box
        position="absolute"
        top="-40px"
        left="50%"
        transform="translateX(-50%)"
        w="180px"
        h="80px"
        bg="rgba(229,62,62,0.1)"
        borderRadius="full"
        filter="blur(32px)"
        pointerEvents="none"
      />

      {/* ── Logo ────────────────────────────────────────────────────── */}
      <Flex
        h="72px"
        alignItems="center"
        justifyContent={isCollapsed ? "center" : "flex-start"}
        px={isCollapsed ? 0 : 6}
        borderBottom="1px solid rgba(255,255,255,0.06)"
        flexShrink={0}
        gap={3}
        position="relative"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 18 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            w="38px"
            h="38px"
            borderRadius="10px"
            bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 0 18px rgba(229,62,62,0.45)"
            flexShrink={0}
          >
            <Icon color="white" style={{ width: 20, height: 20 }}>
              <Shield />
            </Icon>
          </Box>
        </motion.div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={logoTextVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Text
                fontSize="xl"
                fontWeight="800"
                letterSpacing="widest"
                className="shimmer-text"
                whiteSpace="nowrap"
              >
                AIDEP
              </Text>
              <Text
                fontSize="9px"
                color="whiteAlpha.500"
                letterSpacing="widest"
                mt="-2px"
              >
                AFET YÖNETİM SİSTEMİ
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>

      {/* ── Nav Items ───────────────────────────────────────────────── */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 20,
          paddingLeft: isCollapsed ? 8 : 12,
          paddingRight: isCollapsed ? 8 : 12,
          flex: 1,
          overflow: "hidden",
        }}
      >
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <motion.div key={item.path} variants={itemVariants}>
              <Tooltip
                content={isCollapsed ? item.name : ""}
                positioning={{ placement: "right" }}
              >
                <Box>
                  <NavLink to={item.path} style={{ textDecoration: "none" }}>
                    <motion.div
                      whileHover={{ x: isCollapsed ? 0 : 3, scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{
                        type: "spring" as const,
                        stiffness: 400,
                        damping: 22,
                      }}
                    >
                      <Flex
                        align="center"
                        py="10px"
                        px={isCollapsed ? 0 : 4}
                        justifyContent={isCollapsed ? "center" : "flex-start"}
                        borderRadius="12px"
                        cursor="pointer"
                        position="relative"
                        bg={isActive ? "rgba(229,62,62,0.12)" : "transparent"}
                        border="1px solid"
                        borderColor={
                          isActive ? "rgba(229,62,62,0.22)" : "transparent"
                        }
                        color={isActive ? "white" : "rgba(148,163,184,0.8)"}
                        transition="all 0.2s ease"
                        _hover={{
                          bg: isActive
                            ? "rgba(229,62,62,0.15)"
                            : "rgba(255,255,255,0.05)",
                          color: "white",
                          borderColor: isActive
                            ? "rgba(229,62,62,0.3)"
                            : "rgba(255,255,255,0.08)",
                        }}
                      >
                        {/* Active glow bar */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              layoutId="activeBar"
                              initial={{ opacity: 0, scaleY: 0 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              exit={{ opacity: 0, scaleY: 0 }}
                              transition={{
                                type: "spring" as const,
                                stiffness: 500,
                                damping: 30,
                              }}
                              style={{
                                position: "absolute",
                                left: -3,
                                top: "50%",
                                translateY: "-50%",
                                width: "3px",
                                height: "20px",
                                borderRadius: "0 3px 3px 0",
                                background:
                                  "linear-gradient(to bottom, #ff5555, #e53e3e)",
                                boxShadow:
                                  "0 0 10px rgba(229,62,62,0.8), 0 0 20px rgba(229,62,62,0.3)",
                              }}
                            />
                          )}
                        </AnimatePresence>

                        {/* Icon */}
                        <Box
                          color={isActive ? "#ff5555" : "inherit"}
                          display="flex"
                          style={{
                            filter: isActive
                              ? "drop-shadow(0 0 6px rgba(229,62,62,0.6))"
                              : "none",
                          }}
                        >
                          <item.icon size={19} />
                        </Box>

                        {/* Label */}
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              transition={{ duration: 0.18 }}
                              style={{
                                marginLeft: 12,
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 500,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Flex>
                    </motion.div>
                  </NavLink>
                </Box>
              </Tooltip>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Separator ───────────────────────────────────────────────── */}
      <Separator borderColor="rgba(255,255,255,0.06)" />

      {/* ── Collapse Toggle ─────────────────────────────────────────── */}
      <Flex p={4} justifyContent={isCollapsed ? "center" : "flex-end"}>
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}>
          <IconButton
            aria-label="Toggle Sidebar"
            onClick={onToggle}
            variant="ghost"
            size="sm"
            borderRadius="full"
            color="whiteAlpha.500"
            _hover={{ bg: "rgba(255,255,255,0.08)", color: "white" }}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </IconButton>
        </motion.div>
      </Flex>
    </motion.nav>
  );
};

export default Sidebar;
