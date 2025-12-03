import { extendTheme } from '@chakra-ui/react';

const createTheme = (settings) => {
  // Use settings to dynamically create the theme
  const { backgroundColor, textColor, accentColor, contentBackgroundColor } = settings.theme;

  return extendTheme({
    styles: {
      global: {
        body: {
          bg: backgroundColor || '#1A202C',
          color: textColor || 'white',
        },
      },
    },
    colors: {
      brand: {
        500: accentColor || '#805AD5',
        600: `${accentColor}CC`, // A slightly darker/more opaque version for hover
      },
    },
    components: {
      Button: {
        baseStyle: {
          fontWeight: 'bold',
          borderRadius: 'lg',
        },
        variants: {
          solid: {
            bg: 'brand.500',
            color: textColor || 'white',
            _hover: {
              bg: 'brand.600',
            },
          },
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
      Modal: {
        baseStyle: {
          dialog: {
            bg: contentBackgroundColor ? `${contentBackgroundColor}E6` : 'rgba(45, 55, 72, 0.9)', // Make it slightly transparent
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: textColor || 'white',
          },
        },
      },
    },
  });
};

export default createTheme;
