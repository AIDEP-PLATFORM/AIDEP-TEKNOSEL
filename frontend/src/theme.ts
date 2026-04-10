import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        emergency: {
          50: { value: '#ffe5e5' },
          100: { value: '#fbb8b8' },
          200: { value: '#f48a8a' },
          300: { value: '#ef5c5c' },
          400: { value: '#ea2e2e' },
          500: { value: '#e53e3e' },
          600: { value: '#b42727' },
          700: { value: '#821b1b' },
          800: { value: '#510f0f' },
          900: { value: '#220303' },
        },
        warning: {
          50: { value: '#fff6e5' },
          100: { value: '#ffe1b8' },
          200: { value: '#ffcb8a' },
          300: { value: '#ffb65c' },
          400: { value: '#ffa02e' },
          500: { value: '#d69e2e' },
          600: { value: '#a67b22' },
          700: { value: '#775716' },
          800: { value: '#48340a' },
          900: { value: '#1a1100' },
        },
        safe: {
          50: { value: '#e5f6eb' },
          100: { value: '#bbe5cd' },
          200: { value: '#90d4ae' },
          300: { value: '#64c48f' },
          400: { value: '#39b371' },
          500: { value: '#38a169' },
          600: { value: '#2b7d51' },
          700: { value: '#1d5a39' },
          800: { value: '#0f3621' },
          900: { value: '#041308' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
export default system;
