import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    emergency: {
      50: '#ffe5e5',
      100: '#fbb8b8',
      200: '#f48a8a',
      300: '#ef5c5c',
      400: '#ea2e2e',
      500: '#e53e3e', // Primary emergency (red)
      600: '#b42727',
      700: '#821b1b',
      800: '#510f0f',
      900: '#220303',
    },
    warning: {
      50: '#fff6e5',
      100: '#ffe1b8',
      200: '#ffcb8a',
      300: '#ffb65c',
      400: '#ffa02e',
      500: '#d69e2e', // Primary warning (yellow)
      600: '#a67b22',
      700: '#775716',
      800: '#48340a',
      900: '#1a1100',
    },
    safe: {
      50: '#e5f6eb',
      100: '#bbe5cd',
      200: '#90d4ae',
      300: '#64c48f',
      400: '#39b371',
      500: '#38a169', // Primary safe (green)
      600: '#2b7d51',
      700: '#1d5a39',
      800: '#0f3621',
      900: '#041308',
    },
  },
});

export default theme;
