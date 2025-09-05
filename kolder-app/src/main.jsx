/**
 * @file This is the main entry point for the React application.
 * It sets up the Chakra UI provider and renders the main App component.
 */
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, Spinner } from '@chakra-ui/react'
import './index.css'
import App from './App.jsx'
import './i18n'; // Import the i18n configuration

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider>
      <Suspense fallback={<Spinner size="xl" />}>
        <App />
      </Suspense>
    </ChakraProvider>
  </StrictMode>,
)
