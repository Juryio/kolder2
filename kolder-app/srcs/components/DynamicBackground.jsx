import { Box } from '@chakra-ui/react';

const DynamicBackground = ({ settings }) => {
  const { background } = settings;

  if (!background) return null;

  const style = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    transition: 'background 0.5s ease-in-out',
  };

  if (background.type === 'image') {
    style.backgroundImage = `url(${background.imageUrl})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  } else if (background.type === 'solid') {
    style.backgroundColor = settings.theme.backgroundColor;
  } else {
    // Gradient (default)
    style.backgroundColor = settings.theme.backgroundColor;
    style.backgroundSize = '150% 150%';
    style.animation = 'background-pan 30s linear infinite';

    const bgImage = `
      radial-gradient(circle at 20% 20%, ${background.gradientColors[0]}, transparent 30%),
      radial-gradient(circle at 80% 30%, ${background.gradientColors[1]}, transparent 30%),
      radial-gradient(circle at 50% 80%, ${background.gradientColors[2]}, transparent 30%)
    `;

    style.backgroundImage = bgImage;
    style.filter = 'blur(100px)';
  }

  return <Box sx={style} />;
};

export default DynamicBackground;
