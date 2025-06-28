const Button = {
  // Base styles applied to all buttons
  baseStyle: {
    fontWeight: 'semibold',
    borderRadius: 'md',
    transition: 'all 0.2s',
  },

  // Size variations
  sizes: {
    icon: {
      h: '32px',
      minW: '32px',
      fontSize: 'sm',
      px: 2,
    },
    action: {
      h: '36px',
      minW: '36px',
      fontSize: 'sm',
      px: 3,
    },
    standard: {
      h: '40px',
      minW: '40px',
      fontSize: 'md',
      px: 4,
    },
    modal: {
      h: '40px',
      minW: '40px',
      fontSize: 'md',
      px: 4,
    },
  },

  // Visual style variants
  variants: {
    primary: {
      bg: 'ipd.blue',
      color: 'white',
      _hover: {
        bg: 'blue.600',
        _disabled: {
          bg: 'blue.300',
        },
      },
      _active: {
        bg: 'blue.700',
      },
      _disabled: {
        bg: 'blue.300',
        opacity: 0.6,
      },
    },
    secondary: {
      bg: 'white',
      color: 'ipd.textDark',
      border: '1px solid',
      borderColor: 'ipd.border',
      _hover: {
        bg: 'ipd.hover',
        borderColor: 'ipd.blue',
      },
      _active: {
        bg: 'gray.100',
      },
    },
    danger: {
      bg: 'red.500',
      color: 'white',
      _hover: {
        bg: 'red.600',
        _disabled: {
          bg: 'red.300',
        },
      },
      _active: {
        bg: 'red.700',
      },
      _disabled: {
        bg: 'red.300',
        opacity: 0.6,
      },
    },
    ghost: {
      bg: 'transparent',
      color: 'ipd.textDark',
      _hover: {
        bg: 'ipd.hover',
      },
      _active: {
        bg: 'gray.100',
      },
    },
    'ghost-danger': {
      bg: 'transparent',
      color: 'red.500',
      _hover: {
        bg: 'red.50',
        color: 'red.600',
      },
      _active: {
        bg: 'red.100',
      },
    },
    'ghost-primary': {
      bg: 'transparent',
      color: 'ipd.blue',
      _hover: {
        bg: 'blue.50',
        color: 'blue.600',
      },
      _active: {
        bg: 'blue.100',
      },
    },
    action: {
      bg: 'teal.500',
      color: 'white',
      _hover: {
        bg: 'teal.600',
        _disabled: {
          bg: 'teal.300',
        },
      },
      _active: {
        bg: 'teal.700',
      },
      _disabled: {
        bg: 'teal.300',
        opacity: 0.6,
      },
    },
  },

  // Default values
  defaultProps: {
    size: 'standard',
    variant: 'primary',
  },
};

export default Button;
