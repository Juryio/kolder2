import { useState, useEffect } from 'react';
import { evaluatePlaceholders } from '../utils/placeholder-evaluator';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './quill.css'; // For consistent styling if needed

const api = axios.create({
    baseURL: '/api',
});

// A new sub-component to manage the date variables UI in the viewer
const DateManager = ({ content, dateValues, onDateChange }) => {
    const placeholderRegex = /{{\s*([^}]+)\s*}}/g;
    const dateVarRegex = /^date:(\w+)/; // Matches "date:name" at the start of an expression

    const found = content.matchAll(placeholderRegex);
    const baseVars = new Set();
    for (const match of found) {
        const expression = match[1]; // e.g., "date:invoice_date + 5d"
        const dateVarMatch = expression.match(dateVarRegex);
        if (dateVarMatch) {
            // dateVarMatch[1] will be "invoice_date"
            baseVars.add(dateVarMatch[1]);
        }
    }
    const uniqueBaseVars = [...baseVars];

    if (uniqueBaseVars.length === 0) {
        return null;
    }

    return (
        <Box mt={4}>
            <Heading size="sm" mb="2">Set Dates</Heading>
            {uniqueBaseVars.map(varName => (
                <FormControl key={varName} mt="2">
                    <FormLabel>{varName}</FormLabel>
                    <DatePicker
                        selected={dateValues[varName] ? new Date(dateValues[varName]) : null}
                        onChange={date => onDateChange(varName, date)}
                        customInput={<Input />}
                        dateFormat="dd.MM.yyyy"
                        isClearable
                    />
                </FormControl>
            ))}
        </Box>
    );
};

const SnippetViewer = ({ snippet, onBack, settings }) => {
  const [placeholders, setPlaceholders] = useState({});
  const [viewerDateValues, setViewerDateValues] = useState({});
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

    // This regex now finds simple {{placeholders}} but ignores the {{date:...}} ones
    const placeholderRegex = /{{\s*(?!date:)([^}]+)\s*}}/g;
    const foundPlaceholders = [...snippet.content.matchAll(placeholderRegex)];
    const initialPlaceholders = {};

    const placeholderNames = new Set();
    foundPlaceholders.forEach(match => {
        const name = match[1];
        if (name) {
            placeholderNames.add(name.trim());
        }
    });

    placeholderNames.forEach(name => {
        initialPlaceholders[name] = '';
    });

    setPlaceholders(initialPlaceholders);
    setViewerDateValues({}); // Also reset date values
    setPrefix(''); // Reset prefix when snippet changes
  }, [snippet]);

  const handleDateChange = (variableName, date) => {
    setViewerDateValues(prev => ({
      ...prev,
      [variableName]: date ? date.toISOString() : null,
    }));
  };

  // Update the final output when prefix, placeholders, or dates change
  useEffect(() => {
    // 1. Evaluate our new dynamic date placeholders first
    const evaluatedContent = evaluatePlaceholders(snippet.content, viewerDateValues);

    // 2. The existing logic for simple text placeholders then runs on the result
    let snippetWithPlaceholders = evaluatedContent || '';
    for (const key in placeholders) {
      const replacementRegex = new RegExp(`{{${key}}}`, 'g');
      snippetWithPlaceholders = snippetWithPlaceholders.replace(replacementRegex, placeholders[key]);
    }
    setOutput(prefix + snippetWithPlaceholders);
  }, [prefix, placeholders, snippet, viewerDateValues]);

  const handleCopy = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = output;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(plainText).then(() => {
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        });
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = plainText;
        textArea.style.position = "fixed";
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

          <DateManager
            content={snippet.content || ''}
            dateValues={viewerDateValues}
            onDateChange={handleDateChange}
          />

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
