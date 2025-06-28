import { mode } from '@chakra-ui/theme-tools';

const styles = {
  global: (props: any) => ({
    'html, body': {
      bg: 'bg.primary',
      color: 'text.primary',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    },
    // Ensure proper dark mode for various elements
    '*': {
      borderColor: 'border.primary',
    },
    // Scrollbar styling for dark mode
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'bg.secondary',
    },
    '::-webkit-scrollbar-thumb': {
      bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.400',
      borderRadius: '24px',
      '&:hover': {
        bg: props.colorMode === 'dark' ? 'gray.500' : 'gray.500',
      },
    },
    // Input and textarea dark mode support
    'input, textarea, select': {
      bg: 'bg.primary',
      color: 'text.primary',
      borderColor: 'border.primary',
      _placeholder: {
        color: 'text.tertiary',
      },
    },
    // Modal and popover dark mode
    '.chakra-modal__content': {
      bg: 'bg.card',
      color: 'text.primary',
    },
    '.chakra-popover__content': {
      bg: 'bg.card',
      color: 'text.primary',
      borderColor: 'border.primary',
    },
    '.chakra-menu__menu-list': {
      bg: 'bg.card',
      color: 'text.primary',
      borderColor: 'border.primary',
    },
    '.chakra-menu__item': {
      _hover: {
        bg: 'bg.hover',
      },
      _focus: {
        bg: 'bg.hover',
      },
    },
    // Tooltip dark mode
    '.chakra-tooltip': {
      bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.700',
      color: 'white',
    },
    // Alert dark mode
    '.chakra-alert': {
      bg: 'bg.card',
      color: 'text.primary',
    },
    // Table dark mode
    table: {
      bg: 'bg.card',
    },
    'th, td': {
      borderColor: 'border.primary',
    },
    'thead th': {
      bg: mode('gray.100', 'gray.700')(props),
      color: 'text.primary',
    },
    'tbody tr': {
      _hover: {
        bg: 'bg.hover',
      },
    },
    // Code blocks
    'code, pre': {
      bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
      color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
    },
    // Dividers
    hr: {
      borderColor: 'border.primary',
    },
  }),
};

export default styles;
