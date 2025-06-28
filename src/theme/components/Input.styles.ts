const Input = {
  baseStyle: {
    field: {
      borderColor: 'ipd.border',
    },
  },
  variants: {
    outline: {
      field: {
        borderColor: 'ipd.border',
        _hover: {
          borderColor: 'ipd.blue',
        },
        _focus: {
          borderColor: 'ipd.blue',
          boxShadow: '0 0 0 1px var(--chakra-colors-ipd-blue)',
        },
      },
    },
  },
};

export default Input;
