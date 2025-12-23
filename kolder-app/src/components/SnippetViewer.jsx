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
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './quill.css'; // For consistent styling if needed

const api = axios.create({
    baseURL: '/api',
});

const renderDateInputs = ({ dateVars, dateValues, onDateChange }) => {
    if (!dateVars || dateVars.length === 0) return [];
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

const renderChoiceInputs = ({ choices, choiceValues, onChoiceChange, allValues }) => {
    if (!choices || choices.length === 0) return [];
    return choices.map(({ name, displayType, options }) => (
        <FormControl key={`choice-${name}`}>
            <FormLabel>{name}</FormLabel>
            {displayType === 'radio' ? (
                <RadioGroup onChange={(value) => onChoiceChange(name, value)} value={choiceValues[name]}>
                    <HStack>
                        {options.map(opt => (
                            <Radio key={opt} value={opt}>
                                {renderPlaceholders(opt, allValues)}
                            </Radio>
                        ))}
                    </HStack>
                </RadioGroup>
            ) : (
                <Select placeholder="Select option" onChange={(e) => onChoiceChange(name, e.target.value)} value={choiceValues[name]}>
                    {options.map(opt => (
                        <option key={opt} value={opt}>
                            {renderPlaceholders(opt, allValues)}
                        </option>
                    ))}
                </Select>
            )}
        </FormControl>
    ));
};

const SnippetViewer = ({ snippet, onBack, settings }) => {
  const [parsedPlaceholders, setParsedPlaceholders] = useState({ text: [], date: [], choice: [] });
  const [textValues, setTextValues] = useState({});
  const [dateValues, setDateValues] = useState({});
  const [choiceValues, setChoiceValues] = useState({});
  const [output, setOutput] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [startingSnippets, setStartingSnippets] = useState([]);
  const [prefix, setPrefix] = useState('');

  useEffect(() => {
    api.get('/starting-snippets')
       .then(response => setStartingSnippets(response.data))
       .catch(error => console.error('Error fetching starting snippets', error));
  }, []);

  useEffect(() => {
    if (snippet && snippet.content) {
        const parsed = parsePlaceholders(snippet.content);
        setParsedPlaceholders(parsed);

        const initialText = {};
        parsed.text.forEach(name => initialText[name] = '');
        setTextValues(initialText);

        const initialDates = {};
        parsed.date.forEach(name => initialDates[name] = null);
        setDateValues(initialDates);

        const initialChoices = {};
        parsed.choice.forEach(c => initialChoices[c.name] = c.options[0] || '');
        setChoiceValues(initialChoices);

    } else {
        setParsedPlaceholders({ text: [], date: [], choice: [] });
        setTextValues({});
        setDateValues({});
        setChoiceValues({});
    }
    setPrefix('');
  }, [snippet]);

  const handleDateChange = (variableName, date) => {
    setDateValues(prev => ({ ...prev, [variableName]: date ? date.toISOString() : null }));
  };

  const handleChoiceChange = (variableName, value) => {
    setChoiceValues(prev => ({ ...prev, [variableName]: value }));
  };

  const handleTextChange = (key, value) => {
    setTextValues(prev => ({ ...prev, [key]: value }));
  };

  const allValues = {
      text: textValues,
      date: dateValues,
      choice: choiceValues,
  };

  useEffect(() => {
    if (snippet && snippet.content) {
        const evaluatedContent = renderPlaceholders(snippet.content, allValues);
        setOutput(prefix + evaluatedContent);
    } else {
        setOutput(prefix);
    }
  }, [prefix, snippet, allValues]);

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

  const dateInputs = renderDateInputs({ dateVars: parsedPlaceholders.date, dateValues, onDateChange: handleDateChange });
  const choiceInputs = renderChoiceInputs({ choices: parsedPlaceholders.choice, choiceValues, onChoiceChange: handleChoiceChange, allValues });
  const textInputs = parsedPlaceholders.text.map(key => (
    <FormControl key={`text-${key}`}>
        <FormLabel>{key}</FormLabel>
        <Input
        value={textValues[key]}
        onChange={(e) => handleTextChange(key, e.target.value)}
        />
    </FormControl>
  ));

  const allInputs = [...dateInputs, ...choiceInputs, ...textInputs];

  return (
    <Box>
      <Flex align="center" mb="4">
        <Button onClick={onBack} leftIcon={<ArrowUturnLeftIcon width={20} height={20} />} mr="4">
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
            _hover={{ bgGradient: `linear(to-r, ${settings?.theme.accentColor}, purple.600)`}}
        >
          {hasCopied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
      </VStack>
    </Box>
  );
};

export default SnippetViewer;
