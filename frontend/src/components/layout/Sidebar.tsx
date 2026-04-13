import { Box, Flex, Icon, IconButton, Separator, Text } from "@chakra-ui/react";
import { AnimatePresence, type Variants, motion } from "framer-motion";
import {
  Activity,
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
  { name: "Depremler", path: "/earthquakes", icon: Activity },
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
        background:
          "linear-gradient(175deg, #1a2332 0%, #141c28 42%, #0f1419 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
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
        bg="rgba(232,93,93,0.07)"
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
        borderBottom="1px solid rgba(255,255,255,0.08)"
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
            bg="linear-gradient(135deg, #e87878 0%, #d65f5f 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 0 16px rgba(232,93,93,0.28)"
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
                        bg={isActive ? "rgba(232,93,93,0.1)" : "transparent"}
                        border="1px solid"
                        borderColor={
                          isActive ? "rgba(232,93,93,0.2)" : "transparent"
                        }
                        color={isActive ? "white" : "rgba(203,213,225,0.88)"}
                        transition="background 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s ease, transform 0.25s ease"
                        _hover={{
                          bg: isActive
                            ? "rgba(232,93,93,0.14)"
                            : "rgba(255,255,255,0.06)",
                          color: "white",
                          borderColor: isActive
                            ? "rgba(232,93,93,0.28)"
                            : "rgba(255,255,255,0.1)",
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
                                  "linear-gradient(to bottom, #f87171, #e87878)",
                                boxShadow:
                                  "0 0 8px rgba(232,93,93,0.45), 0 0 16px rgba(232,93,93,0.15)",
                              }}
                            />
                          )}
                        </AnimatePresence>

                        {/* Icon */}
                        <Box
                          color={isActive ? "#fca5a5" : "inherit"}
                          display="flex"
                          style={{
                            filter: isActive
                              ? "drop-shadow(0 0 5px rgba(232,93,93,0.35))"
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
      <Separator borderColor="rgba(255,255,255,0.08)" />

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
