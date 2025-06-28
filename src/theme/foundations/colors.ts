const colors = {
  ipd: {
    // Primary brand colors from IP Dashboard
    red: '#c0282d', // Red from logo
    blue: '#3065B5', // Primary button/action color

    // Background colors - Light mode
    bgMain: 'white',
    bgSidebar: '#F5F6F7',
    bgHeader: 'white',
    bgCard: 'white',

    // Background colors - Dark mode
    bgMainDark: '#121212',
    bgSidebarDark: '#1A1A1A',
    bgHeaderDark: '#1A1A1A',
    bgCardDark: '#1E1E1E',

    // Border colors
    border: '#E0E1E2',
    borderLight: '#EAEAEA',
    borderDark: '#2D2D2D',
    borderLightDark: '#404040',

    // Text colors
    textDark: '#333333',
    textMedium: '#666666',
    textLight: '#999999',

    // Text colors - Dark mode (adjusted for better readability)
    textDarkInverse: '#FFFFFF', // Pure white for headers
    textMediumInverse: '#E0E0E0', // Brighter secondary text
    textLightInverse: '#A0A0A0', // Brighter tertiary text

    // UI element colors
    hover: '#F9FAFB',
    selected: '#EBF3FF',
    focus: '#D9E8FF',

    // UI element colors - Dark mode
    hoverDark: '#2A2A2A',
    selectedDark: '#2D3748',
    focusDark: '#4A5568',
  },

  // Semantic color tokens for easier color mode switching
  semanticTokens: {
    colors: {
      // Backgrounds
      'bg.primary': {
        default: 'ipd.bgMain',
        _dark: 'ipd.bgMainDark',
      },
      'bg.secondary': {
        default: 'ipd.bgSidebar',
        _dark: 'ipd.bgSidebarDark',
      },
      'bg.card': {
        default: 'ipd.bgCard',
        _dark: 'ipd.bgCardDark',
      },
      'bg.header': {
        default: 'ipd.bgHeader',
        _dark: 'ipd.bgSidebarDark',
      },

      // Borders
      'border.primary': {
        default: 'ipd.border',
        _dark: 'ipd.borderDark',
      },
      'border.light': {
        default: 'ipd.borderLight',
        _dark: 'ipd.borderLightDark',
      },

      // Text
      'text.primary': {
        default: 'ipd.textDark',
        _dark: 'ipd.textDarkInverse',
      },
      'text.secondary': {
        default: 'ipd.textMedium',
        _dark: 'ipd.textMediumInverse',
      },
      'text.tertiary': {
        default: 'ipd.textLight',
        _dark: 'ipd.textLightInverse',
      },

      // Interactive states
      'bg.hover': {
        default: 'ipd.hover',
        _dark: 'ipd.hoverDark',
      },
      'bg.selected': {
        default: 'ipd.selected',
        _dark: 'ipd.selectedDark',
      },
      'bg.focus': {
        default: 'ipd.focus',
        _dark: 'ipd.focusDark',
      },
    },
  },
};

export default colors;
