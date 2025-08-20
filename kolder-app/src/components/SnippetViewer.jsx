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
  useClipboard,
  VStack,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const SnippetViewer = ({ snippet, onBack }) => {
  const [placeholders, setPlaceholders] = useState({});
  const [output, setOutput] = useState('');
  const { hasCopied, onCopy } = useClipboard(output);

  useEffect(() => {
    const placeholderRegex = /{{(.*?)}}/g;
    const foundPlaceholders = [...snippet.content.matchAll(placeholderRegex)];
    const initialPlaceholders = {};
    foundPlaceholders.forEach(match => {
        initialPlaceholders[match[1]] = '';
    });
    setPlaceholders(initialPlaceholders);
  }, [snippet]);

  useEffect(() => {
    let newOutput = snippet.content;
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
        <Box>
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
          <Box p="4" borderWidth="1px" borderRadius="md" bg="gray.50" _dark={{ bg: 'gray.700' }}>
            <Text whiteSpace="pre-wrap">{output}</Text>
          </Box>
        </Box>

        <Button onClick={onCopy} disabled={!output}>
          {hasCopied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
      </VStack>
    </Box>
  );
};

export default SnippetViewer;
