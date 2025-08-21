import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

const SnippetViewer = ({ snippet, onBack, settings }) => {
  const [placeholders, setPlaceholders] = useState({});
  const [output, setOutput] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    // 1. Create a temporary element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = output;
    // 2. Get the plain text content
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    // 3. Use the Clipboard API to copy the plain text
    navigator.clipboard.writeText(plainText).then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
    });

    // 4. Track the usage via API
    api.post(`/snippets/${snippet._id}/track`).catch(err => console.error("Failed to track copy", err));
  }

  useEffect(() => {
    if (!snippet.content) return;
    const placeholderRegex = /{{(.*?)}}/g;
    const foundPlaceholders = [...snippet.content.matchAll(placeholderRegex)];
    const initialPlaceholders = {};
    foundPlaceholders.forEach(match => {
        initialPlaceholders[match[1]] = '';
    });
    setPlaceholders(initialPlaceholders);
  }, [snippet]);

  useEffect(() => {
    let newOutput = snippet.content || '';
    for (const key in placeholders) {
      newOutput = newOutput.replace(new RegExp(`{{${key}}}`, 'g'), placeholders[key]);
    }
    setOutput(newOutput);
  }, [placeholders, snippet]);

  const handlePlaceholderChange = (key, value) => {
    setPlaceholders(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Box>
      <Flex align="center" mb="4">
        <Button onClick={onBack} leftIcon={<ArrowBackIcon />} mr="4">
          Back
        </Button>
        <Heading size="md">{snippet.name}</Heading>
      </Flex>

      <VStack spacing="4" align="stretch">
        <Box bg={settings?.theme.contentBackgroundColor} p={4} borderRadius="md">
          <Heading size="sm" mb="2">Fill Placeholders</Heading>
          {Object.keys(placeholders).length > 0 ? (
            Object.keys(placeholders).map(key => (
              <FormControl key={key} mt="2">
                <FormLabel>{key}</FormLabel>
                <Input
                  value={placeholders[key]}
                  onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                />
              </FormControl>
            ))
          ) : (
            <Text>No placeholders in this snippet.</Text>
          )}
        </Box>

        <Box>
          <Heading size="sm" mb="2">Preview</Heading>
          <Box
            p="4"
            borderWidth="1px"
            borderRadius="md"
            bg={settings?.theme.contentBackgroundColor}
            borderColor={settings?.theme.accentColor}
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </Box>

        <Button
            onClick={handleCopy}
            disabled={!output}
            bgGradient={`linear(to-r, ${settings?.theme.accentColor}, purple.500)`}
            _hover={{
                bgGradient: `linear(to-r, ${settings?.theme.accentColor}, purple.600)`
            }}
        >
          {hasCopied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
      </VStack>
    </Box>
  );
};

export default SnippetViewer;
