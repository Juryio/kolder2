import { useState, useEffect } from 'react';
import { renderPlaceholders } from '../utils/placeholder-renderer';
import { parsePlaceholders } from '../utils/placeholder-parser';
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
  RadioGroup,
  Radio,
  HStack,
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
const DateManager = ({ dateVars, dateValues, onDateChange }) => {
    if (!dateVars || dateVars.length === 0) {
        return null;
    }

    return (
        <Box mt={4}>
            <Heading size="sm" mb="2">Set Dates</Heading>
            {dateVars.map(varName => (
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

const ChoiceManager = ({ choices, choiceValues, onChoiceChange }) => {
    if (!choices || choices.length === 0) {
        return null;
    }

    return (
        <Box mt={4}>
            <Heading size="sm" mb="2">Choose Options</Heading>
            {choices.map(({ name, displayType, options }) => (
                <FormControl key={name} mt="2">
                    <FormLabel>{name}</FormLabel>
                    {displayType === 'radio' ? (
                        <RadioGroup onChange={(value) => onChoiceChange(name, value)} value={choiceValues[name]}>
                            <HStack>
                                {options.map(opt => <Radio key={opt} value={opt}>{opt}</Radio>)}
                            </HStack>
                        </RadioGroup>
                    ) : (
                        <Select placeholder="Select option" onChange={(e) => onChoiceChange(name, e.target.value)} value={choiceValues[name]}>
                            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </Select>
                    )}
                </FormControl>
            ))}
        </Box>
    );
};

const SnippetViewer = ({ snippet, onBack, settings }) => {
  const [parsedPlaceholders, setParsedPlaceholders] = useState({ text: [], date: [], choice: [] });
  const [placeholders, setPlaceholders] = useState({});
  const [viewerDateValues, setViewerDateValues] = useState({});
  const [choiceValues, setChoiceValues] = useState({});
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

  // Parse placeholders whenever the snippet content changes
  useEffect(() => {
    if (snippet && snippet.content) {
        const parsed = parsePlaceholders(snippet.content);
        setParsedPlaceholders(parsed);

        // Initialize values
        const initialTextValues = {};
        parsed.text.forEach(name => initialTextValues[name] = '');
        setPlaceholders(initialTextValues);

        setViewerDateValues({});
        setChoiceValues({});
    } else {
        // Clear everything if there's no snippet
        setParsedPlaceholders({ text: [], date: [], choice: [] });
        setPlaceholders({});
        setViewerDateValues({});
        setChoiceValues({});
    }
    setPrefix(''); // Reset prefix when snippet changes
  }, [snippet]);

  const handleDateChange = (variableName, date) => {
    setViewerDateValues(prev => ({
      ...prev,
      [variableName]: date ? date.toISOString() : null,
    }));
  };

  const handleChoiceChange = (variableName, value) => {
    setChoiceValues(prev => ({
        ...prev,
        [variableName]: value,
    }));
  };

  // Update the final output when prefix, placeholders, or dates change
  useEffect(() => {
    if (snippet && snippet.content) {
        const allValues = {
            text: placeholders,
            date: viewerDateValues,
            choice: choiceValues,
        };
        const evaluatedContent = renderPlaceholders(snippet.content, allValues);
        setOutput(prefix + evaluatedContent);
    } else {
        setOutput(prefix);
    }
  }, [prefix, placeholders, snippet, viewerDateValues, choiceValues]);

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
            dateVars={parsedPlaceholders.date}
            dateValues={viewerDateValues}
            onDateChange={handleDateChange}
          />

          <ChoiceManager
            choices={parsedPlaceholders.choice}
            choiceValues={choiceValues}
            onChoiceChange={handleChoiceChange}
          />

          {parsedPlaceholders.text.length > 0 && (
            <Box mt={4}>
                <Heading size="sm" mb="2">Fill Placeholders</Heading>
                {parsedPlaceholders.text.map(key => (
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
