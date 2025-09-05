import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api',
});

/**
 * A page that displays analytics about snippet usage.
 * @param {object} props - The component's props.
 * @param {function} props.onBack - Function to call to return to the main view.
 * @param {Array<object>} props.snippets - The list of snippets.
 * @param {function} props.setSnippets - Function to update the list of snippets.
 * @param {object} props.settings - The application settings, used for theming.
 * @returns {JSX.Element} The rendered component.
 */
const AnalyticsPage = ({ onBack, snippets, setSnippets, settings }) => {
    const toast = useToast();
    const sortedSnippets = [...snippets].sort((a, b) => b.useCount - a.useCount);

    const totalUses = snippets.reduce((acc, snippet) => acc + snippet.useCount, 0);

    /**
     * Handles the click on the "Reset All Analytics" button.
     * Sends a request to the server to reset the use count of all snippets.
     */
    const handleReset = async () => {
        try {
            const response = await api.post('/analytics/reset');
            setSnippets(response.data);
            toast({
                title: 'Analytics Reset',
                description: 'All snippet usage counts have been reset to 0.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error resetting analytics:', error);
            toast({
                title: 'Error',
                description: 'Could not reset analytics.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

  return (
    <Box p={8}>
      <Flex align="center" mb="8" justify="space-between">
        <Flex align="center">
            <Button onClick={onBack} leftIcon={<ArrowBackIcon />} mr="4">
                Back to Main
            </Button>
            <Heading size="lg">Snippet Analytics</Heading>
        </Flex>
        <Button
            bgGradient="linear(to-r, red.500, red.600)"
            _hover={{
                bgGradient: 'linear(to-r, red.600, red.700)',
            }}
            onClick={handleReset}
        >
            Reset All Analytics
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={8}>
        <Stat p={4} bg={settings?.theme.contentBackgroundColor} borderWidth="1px" borderRadius="md">
          <StatLabel>Total Snippets</StatLabel>
          <StatNumber>{snippets.length}</StatNumber>
        </Stat>
        <Stat p={4} bg={settings?.theme.contentBackgroundColor} borderWidth="1px" borderRadius="md">
          <StatLabel>Total Snippet Uses</StatLabel>
          <StatNumber>{totalUses}</StatNumber>
        </Stat>
        <Stat p={4} bg={settings?.theme.contentBackgroundColor} borderWidth="1px" borderRadius="md">
          <StatLabel>Most Used Snippet</StatLabel>
          <StatNumber>{sortedSnippets[0]?.name || 'N/A'}</StatNumber>
          <StatHelpText>Used {sortedSnippets[0]?.useCount || 0} times</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Heading size="md" mb={4}>Usage Breakdown</Heading>
      <VStack spacing={4} align="stretch">
        {sortedSnippets.map(snippet => (
          <Flex key={snippet._id} p={4} bg={settings?.theme.contentBackgroundColor} borderWidth="1px" borderRadius="md" justify="space-between" align="center">
            <Text fontWeight="bold">{snippet.name}</Text>
            <Text>{snippet.useCount} uses</Text>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default AnalyticsPage;
