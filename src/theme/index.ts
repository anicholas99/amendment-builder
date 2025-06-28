import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Import foundations
import colors from './foundations/colors';
import typography from './foundations/fonts'; // Renamed for clarity
import shadows from './foundations/shadows';

// Import global styles
import styles from './styles';

// Import component styles
import Button from './components/Button.styles';
import Input from './components/Input.styles';
import Menu from './components/Menu.styles';
import Card from './components/Card.styles';
import Tabs from './components/Tabs.styles';
import Table from './components/Table.styles';
import ModalHeader from './components/ModalHeader.styles';
import AlertDialogHeader from './components/AlertDialogHeader.styles';

// Theme configuration for color mode
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true, // Respect system preferences
};

/**
 * Theme configuration for Patent Drafter AI
 *
 * Combines foundational styles and component-specific styles.
 */
const theme = extendTheme({
  config,
  colors: colors.ipd ? { ipd: colors.ipd } : colors,
  semanticTokens: colors.semanticTokens || {},
  ...typography, // Spread typography settings (fonts, fontSizes, etc.)
  shadows,
  styles,
  components: {
    Button,
    Input,
    Menu,
    Card,
    Tabs,
    Table,
    ModalHeader,
    AlertDialogHeader,
    // Add other components here as they are styled
  },
});

export { theme };
export default theme;
