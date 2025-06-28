const Tabs = {
  variants: {
    enclosed: {
      tab: {
        bg: 'bg.secondary',
        color: 'text.secondary',
        borderColor: 'border.primary',
        _selected: {
          color: 'ipd.blue',
          bg: 'bg.primary',
          borderColor: 'border.primary',
          borderBottomColor: 'bg.primary',
        },
        _hover: {
          bg: 'bg.hover',
        },
      },
      tablist: {
        borderColor: 'border.primary',
        bg: 'bg.secondary',
      },
      tabpanel: {
        bg: 'bg.primary',
        borderColor: 'border.primary',
        borderTopWidth: 0,
      },
    },
    line: {
      tab: {
        color: 'text.secondary',
        _selected: {
          color: 'ipd.blue',
          borderColor: 'ipd.blue',
          borderBottomWidth: '3px',
        },
        _hover: {
          color: 'text.primary',
        },
      },
      tablist: {
        borderBottomColor: 'border.primary',
        borderBottomWidth: '1px',
      },
    },
  },
  parts: ['tab', 'tablist', 'tabpanel', 'tabpanels'],
  defaultProps: {
    variant: 'line',
    colorScheme: 'blue',
    size: 'sm',
  },
  baseStyle: {
    tab: {
      fontWeight: 'medium',
      transition:
        'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
      _focus: {
        boxShadow: 'none',
      },
      _selected: {
        borderBottomWidth: '3px',
      },
    },
    tablist: {
      bg: 'bg.secondary',
      borderBottomWidth: '0px',
    },
    tabpanel: {
      p: 0,
    },
    tabpanels: {
      // Removed scrollbarGutter: 'stable' to prevent uneven margins
    },
    indicator: {
      transition: 'none',
    },
  },
};

export default Tabs;
