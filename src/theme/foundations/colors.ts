const colors = {
  ipd: {
    // Primary brand colors from IP Dashboard
    red: '#c0282d', // Red from logo
    blue: '#3065B5', // Primary button/action color

    // Background colors - Light mode
    bgMain: 'white',
    bgSidebar: '#F5F6F7',
    bgHeader: 'white',
    bgCard: 'white', // Back to pure white
    bgPanelHeader: '#f8f9fb', // Subtle blue-gray for panel headers
    bgHover: '#F9FAFB',
    bgSelected: '#EBF3FF',

    // Background colors - Dark mode
    bgMainDark: '#1e1e1e', // VS Code dark theme
    bgSidebarDark: '#252526',
    bgHeaderDark: '#2d2d30',
    bgCardDark: '#252526',
    bgPanelHeaderDark: '#2a2d2e', // Subtle header for panel headers in dark mode
    bgHoverDark: '#2a2d2e',
    bgSelectedDark: '#094771',
    bgInputDark: '#3c3c3c',
    bgModalDark: '#252526',

    // Border colors
    border: '#E0E1E2',
    borderLight: '#EAEAEA',
    borderDark: '#464647',
    borderLightDark: '#464647',

    // Text colors
    textDark: '#333333',
    textMedium: '#666666',
    textLight: '#999999',

    // Text colors - Dark mode
    textDarkInverse: '#cccccc', // VS Code text color
    textMediumInverse: '#969696',
    textLightInverse: '#6e6e6e',

    // UI element colors
    hover: '#F9FAFB',
    selected: '#EBF3FF',
    focus: '#D9E8FF',

    // UI element colors - Dark mode
    hoverDark: '#2a2d2e',
    selectedDark: '#094771',
    focusDark: '#007acc',

    // Scrollbar colors - Dark mode
    scrollbarTrackDark: '#1e1e1e',
    scrollbarThumbDark: '#424242',
    scrollbarThumbHoverDark: '#4f4f4f',
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
        _dark: 'ipd.bgHeaderDark',
      },
      'bg.panelHeader': {
        default: 'ipd.bgPanelHeader',
        _dark: 'ipd.bgPanelHeaderDark',
      },
      'bg.modal': {
        default: 'white',
        _dark: 'ipd.bgModalDark',
      },
      'bg.input': {
        default: 'white',
        _dark: 'ipd.bgInputDark',
      },
      'bg.tooltip': {
        default: 'gray.700',
        _dark: 'ipd.bgCardDark',
      },
      'bg.subtle': {
        default: 'gray.50',
        _dark: 'ipd.bgHoverDark',
      },
      'bg.muted': {
        default: 'gray.100',
        _dark: 'ipd.bgCardDark',
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
      'border.subtle': {
        default: 'gray.200',
        _dark: 'gray.600',
      },
      'border.medium': {
        default: 'gray.300',
        _dark: 'gray.500',
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
      'text.muted': {
        default: 'gray.500',
        _dark: 'gray.400',
      },
      'text.subtle': {
        default: 'gray.600',
        _dark: 'gray.300',
      },
      'text.strong': {
        default: 'gray.800',
        _dark: 'gray.100',
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

      // Scrollbar
      'scrollbar.track': {
        default: 'rgba(0, 0, 0, 0.05)',
        _dark: 'ipd.scrollbarTrackDark',
      },
      'scrollbar.thumb': {
        default: 'rgba(0, 0, 0, 0.2)',
        _dark: 'ipd.scrollbarThumbDark',
      },
      'scrollbar.thumbHover': {
        default: 'rgba(0, 0, 0, 0.3)',
        _dark: 'ipd.scrollbarThumbHoverDark',
      },

      // Selection
      'selection.bg': {
        default: 'blue.100',
        _dark: '#264f78',
      },
      'selection.text': {
        default: 'black',
        _dark: 'white',
      },
    },
  },
};

export default colors;
