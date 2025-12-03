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
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const api = axios.create({
    baseURL: '/api',
});

/**
 * Renders the UI for date placeholders.
 * @param {object} props - The component's props.
 * @returns {Array<JSX.Element>} An array of FormControl elements.
 */
const renderDateInputs = ({ dateVars, dateValues, onDateChange }) => {
    if (!dateVars || dateVars.length === 0) {
        return [];
    }

    return dateVars.map(varName => (
        <FormControl key={`date-${varName}`}>
            <FormLabel>{varName}</FormLabel>
            <DatePicker
                selected={dateValues[varName] ? new Date(dateValues[varName]) : null}
                onChange={date => onDateChange(varName, date)}
                customInput={<Input />}
                dateFormat="dd.MM.yyyy"
                isClearable
            />
        </FormControl>
    ));
};

/**
 * Renders the UI for choice placeholders.
 * @param {object} props - The component's props.
 * @returns {Array<JSX.Element>} An array of FormControl elements.
 */
const renderChoiceInputs = ({ choices, choiceValues, onChoiceChange }) => {
    if (!choices || choices.length === 0) {
        return [];
    }

    return choices.map(({ name, displayType, options }) => (
        <FormControl key={`choice-${name}`}>
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
    ));
};

/**
 * A component for viewing a snippet, filling in its placeholders, and copying the result.
 * @param {object} props - The component's props.
 * @param {object} props.snippet - The snippet to view.
 * @param {function} props.onBack - Function to call to return to the list view.
 * @param {object} props.settings - The application settings, used for theming.
 * @returns {JSX.Element} The rendered component.
 */
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

  /**
   * Handles changes to date placeholder values.
   * @param {string} variableName - The name of the date variable.
   * @param {Date | null} date - The new date value.
   */
  const handleDateChange = (variableName, date) => {
    setViewerDateValues(prev => ({
      ...prev,
      [variableName]: date ? date.toISOString() : null,
    }));
  };

  /**
   * Handles changes to choice placeholder values.
   * @param {string} variableName - The name of the choice variable.
   * @param {string} value - The new selected value.
   */
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

  /**
   * Handles copying the rendered output to the clipboard.
   * Also tracks the usage of the snippet.
   */
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

  /**
   * Handles changes to text placeholder values.
   * @param {string} key - The name of the text placeholder.
   * @param {string} value - The new value.
   */
  const handlePlaceholderChange = (key, value) => {
    setPlaceholders(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Handles the selection of a starting snippet.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event.
   */
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

  const dateInputs = renderDateInputs({ dateVars: parsedPlaceholders.date, dateValues: viewerDateValues, onDateChange: handleDateChange });
  const choiceInputs = renderChoiceInputs({ choices: parsedPlaceholders.choice, choiceValues: choiceValues, onChoiceChange: handleChoiceChange });
  const textInputs = parsedPlaceholders.text.map(key => (
    <FormControl key={`text-${key}`}>
        <FormLabel>{key}</FormLabel>
        <Input
        value={placeholders[key]}
        onChange={(e) => handlePlaceholderChange(key, e.target.value)}
        />
    </FormControl>
  ));

  const allInputs = [...dateInputs, ...choiceInputs, ...textInputs];

  return (
    <Box>
      <Flex align="center" mb="4">
        <Button onClick={onBack} leftIcon={<ArrowBackIcon />} mr="4">
          Back
        </Button>
        <Heading size="md">{snippet.name}</Heading>
      </Flex>

      <VStack spacing="4" align="stretch">
        <Box bg={settings?.theme.contentBackgroundColor} p={4} borderRadius="md" boxShadow="md">
          <Heading size="sm" mb="2">Compose Snippet</Heading>
          <FormControl>
            <FormLabel>Add Starting Snippet</FormLabel>
            <Select placeholder="None" onChange={handleStartingSnippetChange}>
                {startingSnippets.map(ss => (
                    <option key={ss._id} value={ss._id}>{ss.name}</option>
                ))}
            </Select>
          </FormControl>

          {allInputs.length > 0 && (
            <Box mt={4}>
                <Heading size="sm" mb="2">Fill Placeholders</Heading>
                <SimpleGrid columns={2} spacing={4} mt={2}>
                    {allInputs}
                </SimpleGrid>
            </Box>
          )}
        </Box>

        <Box>
          <Heading size="sm" mb="2">Preview</Heading>
          <Box
            p="4"
            borderRadius="md"
            minHeight="150px"
            bg={settings?.theme.contentBackgroundColor}
            boxShadow="md"
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
