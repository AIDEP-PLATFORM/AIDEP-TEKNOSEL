import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        /* ── Emergency / Red ──────────────────────────────── */
        emergency: {
          50: { value: "#fff0f0" },
          100: { value: "#ffd6d6" },
          200: { value: "#ffaaaa" },
          300: { value: "#ff7777" },
          400: { value: "#ff4444" },
          500: { value: "#e53e3e" },
          600: { value: "#c53030" },
          700: { value: "#9b2c2c" },
          800: { value: "#6b1f1f" },
          900: { value: "#3d0f0f" },
        },

        /* ── Warning / Amber ──────────────────────────────── */
        warning: {
          50: { value: "#fffbeb" },
          100: { value: "#fef3c7" },
          200: { value: "#fde68a" },
          300: { value: "#fcd34d" },
          400: { value: "#fbbf24" },
          500: { value: "#f59e0b" },
          600: { value: "#d97706" },
          700: { value: "#b45309" },
          800: { value: "#78350f" },
          900: { value: "#451a03" },
        },

        /* ── Safe / Emerald ───────────────────────────────── */
        safe: {
          50: { value: "#ecfdf5" },
          100: { value: "#d1fae5" },
          200: { value: "#a7f3d0" },
          300: { value: "#6ee7b7" },
          400: { value: "#34d399" },
          500: { value: "#10b981" },
          600: { value: "#059669" },
          700: { value: "#047857" },
          800: { value: "#065f46" },
          900: { value: "#064e3b" },
        },

        /* ── Navy / Primary Background ────────────────────── */
        navy: {
          50: { value: "#e8edf5" },
          100: { value: "#c5d0e4" },
          200: { value: "#9eafce" },
          300: { value: "#6e8dba" },
          400: { value: "#4a72a8" },
          500: { value: "#2d5a8e" },
          600: { value: "#1a3d6b" },
          700: { value: "#0f2644" },
          800: { value: "#0d1b35" },
          900: { value: "#060d1f" },
        },

        /* ── Electric Blue (secondary accent) ─────────────── */
        electric: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          200: { value: "#bfdbfe" },
          300: { value: "#93c5fd" },
          400: { value: "#60a5fa" },
          500: { value: "#3b82f6" },
          600: { value: "#2563eb" },
          700: { value: "#1d4ed8" },
          800: { value: "#1e40af" },
          900: { value: "#1e3a8a" },
        },
      },

      fonts: {
        heading: { value: "'Inter', system-ui, sans-serif" },
        body: { value: "'Inter', system-ui, sans-serif" },
      },
    },

    semanticTokens: {
      colors: {
        /* App backgrounds */
        "bg.app": { value: { base: "#f4f7fb", _dark: "#0f1419" } },
        "bg.surface": { value: { base: "#ffffff", _dark: "#151d2a" } },
        "bg.subtle": { value: { base: "#f8fafc", _dark: "#121a26" } },
        "bg.card": { value: { base: "#ffffff", _dark: "rgba(30,41,59,0.72)" } },

        /* Borders */
        "border.default": {
          value: { base: "#e2e8f0", _dark: "rgba(255,255,255,0.09)" },
        },
        "border.subtle": {
          value: { base: "#f1f5f9", _dark: "rgba(255,255,255,0.05)" },
        },

        /* Brand */
        "brand.primary": { value: "#e85d5d" },
        "brand.secondary": { value: "#60a5fa" },
        "brand.glow": { value: "rgba(232,93,93,0.22)" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
export default system;
