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
  Select,
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
  const [startingSnippets, setStartingSnippets] = useState([]);
  const [prefix, setPrefix] = useState('');

  // Fetch starting snippets
  useEffect(() => {
    api.get('/starting-snippets')
       .then(response => setStartingSnippets(response.data))
       .catch(error => console.error('Error fetching starting snippets', error));
  }, []);

  // Set placeholders when snippet changes
  useEffect(() => {
    if (!snippet.content) return;
    const placeholderRegex = /{{(.*?)}}/g;
    const foundPlaceholders = [...snippet.content.matchAll(placeholderRegex)];
    const initialPlaceholders = {};
    foundPlaceholders.forEach(match => {
        initialPlaceholders[match[1]] = '';
    });
    setPlaceholders(initialPlaceholders);
    setPrefix(''); // Reset prefix when snippet changes
  }, [snippet]);

  // Update the final output when prefix or placeholders change
  useEffect(() => {
    let snippetWithPlaceholders = snippet.content || '';
    for (const key in placeholders) {
      snippetWithPlaceholders = snippetWithPlaceholders.replace(new RegExp(`{{${key}}}`, 'g'), placeholders[key]);
    }
    setOutput(prefix + snippetWithPlaceholders);
  }, [prefix, placeholders, snippet]);

  const handleCopy = () => {
    // 1. Convert HTML to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = output;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    // 2. Try modern clipboard API, with fallback for insecure contexts
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(plainText).then(() => {
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        });
    } else {
        // Fallback for insecure contexts (http) or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = plainText;
        textArea.style.position = "fixed";  // Avoid scrolling to bottom
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    }

    // 3. Track usage
    api.post(`/snippets/${snippet._id}/track`).catch(err => console.error("Failed to track copy", err));
  }

  const handlePlaceholderChange = (key, value) => {
    setPlaceholders(prev => ({ ...prev, [key]: value }));
  };

  const handleStartingSnippetChange = (e) => {
    const snippetId = e.target.value;
    if (!snippetId) {
        setPrefix('');
        return;
    }
    const selected = startingSnippets.find(ss => ss._id === snippetId);
    if (selected) {
        setPrefix(selected.content + '<p><br></p>');
    }
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
          <Heading size="sm" mb="2">Compose Snippet</Heading>
          <FormControl>
            <FormLabel>Add Starting Snippet</FormLabel>
            <Select placeholder="None" onChange={handleStartingSnippetChange}>
                {startingSnippets.map(ss => (
                    <option key={ss._id} value={ss._id}>{ss.name}</option>
                ))}
            </Select>
          </FormControl>

          {Object.keys(placeholders).length > 0 && (
            <Box mt={4}>
                <Heading size="sm" mb="2">Fill Placeholders</Heading>
                {Object.keys(placeholders).map(key => (
                <FormControl key={key} mt="2">
                    <FormLabel>{key}</FormLabel>
                    <Input
                    value={placeholders[key]}
                    onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                    />
                </FormControl>
                ))}
            </Box>
          )}
        </Box>

        <Box>
          <Heading size="sm" mb="2">Preview</Heading>
          <Box
            p="4"
            borderWidth="1px"
            borderRadius="md"
            minHeight="150px"
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
