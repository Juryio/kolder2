import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#1A202C', // Dark background color
        color: 'white',
      },
    },
  },
  colors: {
    brand: {
      500: '#805AD5', // Accent color
    },
    // Add other colors from the Vision UI theme here
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
      },
      variants: {
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
          bg: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          _placeholder: {
            color: 'gray.400',
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
      parts: ['menu'],
      variants: {
        outline: {
          menu: {
            bg: 'rgba(45, 55, 72, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'rgba(45, 55, 72, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

export default theme;
