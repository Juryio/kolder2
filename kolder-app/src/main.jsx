/**
 * @file This is the main entry point for the React application.
 * It sets up the Chakra UI provider and renders the main App component.
 */
import { StrictMode, Suspense, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Spinner, Box } from '@chakra-ui/react';
import createTheme from './theme';
import './index.css';
import App from './App.jsx';
import './i18n';
import axios from 'axios';

const AppWrapper = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings, using default.", error);
        // Set default settings on error
        setSettings({
          theme: { backgroundColor: '#1A202C', textColor: 'white', accentColor: '#805AD5', contentBackgroundColor: '#2D3748' },
          background: { type: 'gradient', gradientColors: ['hsla(210, 80%, 50%, 0.3)', 'hsla(280, 80%, 50%, 0.3)', 'hsla(30, 80%, 50%, 0.3)'] }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const theme = settings ? createTheme(settings) : createTheme({
    theme: {},
    background: {}
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <App initialSettings={settings} />
    </ChakraProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<Spinner size="xl" />}>
      <AppWrapper />
    </Suspense>
  </StrictMode>
);
