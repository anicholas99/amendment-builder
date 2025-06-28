const Card = {
  baseStyle: {
    container: {
      bg: 'bg.card',
      borderWidth: '1px',
      borderColor: 'border.primary',
      boxShadow: 'sm',
      borderRadius: 'md',
      color: 'text.primary',
      transition: 'all 0.2s ease',
      _hover: {
        boxShadow: 'md',
      },
    },
    header: {
      borderBottomWidth: '1px',
      borderColor: 'border.light',
    },
    body: {
      color: 'text.primary',
    },
    footer: {
      borderTopWidth: '1px',
      borderColor: 'border.light',
    },
  },
};

export default Card;
