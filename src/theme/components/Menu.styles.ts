const Menu = {
  baseStyle: {
    button: {
      _hover: {
        bg: 'bg.hover',
      },
      _active: {
        bg: 'bg.focus',
      },
    },
    list: {
      bg: 'bg.card',
      borderColor: 'border.primary',
      color: 'text.primary',
      boxShadow: 'md',
      borderWidth: '1px',
      borderRadius: 'md',
      minW: '160px',
      py: 2,
    },
    item: {
      color: 'text.primary',
      bg: 'transparent',
      _hover: {
        bg: 'bg.hover',
        color: 'text.primary',
      },
      _focus: {
        bg: 'bg.hover',
        color: 'text.primary',
      },
      _active: {
        bg: 'bg.focus',
      },
    },
    divider: {
      borderColor: 'border.primary',
    },
  },
};

export default Menu;
