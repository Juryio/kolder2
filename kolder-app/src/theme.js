import { extendTheme } from '@chakra-ui/react';

const glassLayerStyle = {
  bg: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 'lg',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
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
    },
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
            bg: 'rgba(255, 255, 255, 0.2)',
          },
        },
        solid: (props) => ({
          bgGradient: 'linear(to-r, brand.500, purple.500)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, brand.600, purple.600)',
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
  },
});

export default theme;
