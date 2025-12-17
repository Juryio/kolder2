import { extendTheme } from '@chakra-ui/react';

const glassLayerStyle = {
  bg: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(20px)',
  borderRadius: 'lg',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
};

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#1A202C',
        color: 'white',
      },
    },
  },
  colors: {
    brand: {
      500: '#805AD5',
      600: '#6B46C1', // Darker shade for hover
    },
    purple: {
      500: '#9C27B0',
      600: '#8E24AA',
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
      },
      variants: {
        glass: {
          ...glassLayerStyle,
          color: 'white',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.1)',
          },
        },
        solid: (props) => ({
          bg: 'rgba(128, 90, 213, 0.8)', // brand.500 with 80% opacity
          color: 'white',
          _hover: {
            bg: 'rgba(107, 70, 193, 0.9)', // brand.600 with 90% opacity
          },
        }),
      },
    },
    Input: {
      baseStyle: {
        field: {
          ...glassLayerStyle,
          bg: 'rgba(255, 255, 255, 0.05)',
          _placeholder: {
            color: 'gray.400',
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          ...glassLayerStyle,
          bg: 'rgba(255, 255, 255, 0.05)',
        },
      },
      parts: ['menu'],
      variants: {
        outline: {
          menu: {
            ...glassLayerStyle,
            bg: 'rgba(45, 55, 72, 0.8)',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        overlay: {
          backdropFilter: 'blur(10px)',
        },
        dialog: {
          ...glassLayerStyle,
          bg: 'rgba(45, 55, 72, 0.8)',
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          ...glassLayerStyle,
          bg: 'rgba(45, 55, 72, 0.8)',
        },
        item: {
          bg: 'transparent',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    SnippetItem: {
      baseStyle: {
        bg: 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
});

export default theme;
