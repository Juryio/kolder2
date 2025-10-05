import { useState, useEffect, useRef } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Flex,
  useDisclosure,
  Heading,
  HStack,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  useToast,
} from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill.css';
import PlaceholderBuilderModal from './PlaceholderBuilderModal';
import axios from 'axios';

/**
 * A component for editing a snippet's name and content.
 * @param {object} props - The component's props.
 * @param {function} props.onClose - Function to call when the editor is closed.
 * @param {function} props.onSave - Function to call when the user saves the snippet. It receives the snippet object as an argument.
 * @param {object | null} props.snippet - The snippet to edit, or null if creating a new snippet.
 * @param {object} props.settings - The application settings, used for theming.
 * @returns {JSX.Element} The rendered component.
 */
const SnippetEditor = ({ onClose, onSave, snippet, settings }) => {
  const { isOpen: isBuilderOpen, onOpen: onBuilderOpen, onClose: onBuilderClose } = useDisclosure();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const quillRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (snippet) {
      setName(snippet.name || '');
      setContent(snippet.content || '');
      setTags(snippet.tags || []);
    } else {
      setName('');
      setContent('');
      setTags([]);
    }
    // Clear suggestions when the snippet changes or the editor is opened for a new one.
    setSuggestions([]);
  }, [snippet]);

  /**
   * Checks the grammar of the content using the backend API.
   */
  const handleGrammarCheck = async () => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    // The API expects plain text.
    const text = editor.getText();

    if (!text.trim()) {
      toast({
        title: 'No text to check',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post('/api/languagetool/check', { text });
      setSuggestions(response.data.matches);
      toast({
        title: 'Grammar check complete',
        description: `Found ${response.data.matches.length} suggestions.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Grammar check failed:', error);
      toast({
        title: 'Grammar Check Failed',
        description: error.response?.data?.error || 'Could not connect to the LanguageTool service.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  /**
   * Applies a grammar suggestion to the Quill editor.
   * @param {object} suggestion - The suggestion object from LanguageTool.
   * @param {string} replacementValue - The string to replace the error with.
   */
  const applySuggestion = (suggestion, replacementValue) => {
    const editor = quillRef.current.getEditor();
    // This delta operation uses offsets from the plain text version of the content.
    // It works well for text but may be inaccurate with complex, nested formatting.
    editor.updateContents(new (ReactQuill.Quill.import('delta'))().retain(suggestion.offset).delete(suggestion.length).insert(replacementValue), 'user');
    setSuggestions(prev => prev.filter(s => s !== suggestion));
    toast({ title: 'Suggestion applied', status: 'success', duration: 2000, isClosable: true });
  };
  /**
   * Handles the click on the "Save" button.
   * Calls the onSave prop and closes the editor.
   */
  const handleSave = () => {
    onSave({ ...snippet, name, content, tags });
    onClose();
  };

  /**
   * Inserts a placeholder string into the Quill editor at the current cursor position.
   * @param {string} placeholderString - The placeholder string to insert.
   */
  const handleInsertGeneratedPlaceholder = (placeholderString) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    if (range) {
        editor.insertText(range.index, placeholderString);
    }
  };

  /**
   * Adds a tag when the Enter key is pressed in the tag input field.
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event.
   */
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  /**
   * Adds a new tag to the list.
   */
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  /**
   * Removes a tag from the list.
   * @param {string} tagToRemove - The tag to remove.
   */
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  return (
    <>
      <Box>
        <Heading size="md" mb={4}>{snippet ? 'Edit Snippet' : 'New Snippet'}</Heading>
        <VStack spacing={4} align="stretch">
          <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl>
              <FormLabel>Tags</FormLabel>
              <HStack>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add a tag and press Enter"
                />
                <Button onClick={handleAddTag}>Add</Button>
              </HStack>
              <Wrap mt={2}>
                {tags.map((tag, index) => (
                  <WrapItem key={index}>
                    <Tag
                      size="md"
                      variant="solid"
                      colorScheme="purple"
                    >
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
          </FormControl>
          <FormControl>
              <Flex justify="space-between" align="center">
                <FormLabel mb="0">Content</FormLabel>
                <HStack>
                    {settings?.languageToolEnabled && (
                        <Button size="xs" onClick={handleGrammarCheck}>Check Grammar</Button>
                    )}
                    <Button size="xs" onClick={onBuilderOpen}>Insert Placeholder</Button>
                </HStack>
              </Flex>
              <ReactQuill ref={quillRef} theme="snow" value={content} onChange={(newContent) => { setContent(newContent); setSuggestions([]); }} style={{marginTop: '8px'}}/>
          </FormControl>
        </VStack>
        <Flex mt={4} justify="flex-end">
          <Button
            bgGradient={`linear(to-r, ${settings?.theme.accentColor}, purple.500)`}
            _hover={{
                bgGradient: `linear(to-r, ${settings?.theme.accentColor}, purple.600)`
            }}
            mr={3}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Flex>
        <GrammarSuggestions suggestions={suggestions} onApply={applySuggestion} />
      </Box>
      <PlaceholderBuilderModal
        isOpen={isBuilderOpen}
        onClose={onBuilderClose}
        onInsert={handleInsertGeneratedPlaceholder}
      />
    </>
  );
};

const GrammarSuggestions = ({ suggestions, onApply }) => {
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <Box mt={4} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.600" maxHeight="200px" overflowY="auto">
            <Heading size="sm" mb={2}>Grammar Suggestions</Heading>
            <VStack align="stretch" spacing={3}>
                {suggestions.map((s, i) => (
                    <Box key={`${s.offset}-${i}`} p={2} borderWidth="1px" borderRadius="sm" borderColor="gray.500">
                        <Text fontSize="sm" color="yellow.400" fontWeight="bold">{s.message}</Text>
                        <Text fontSize="sm" my={1} p={1} bg="gray.700" borderRadius="md"><i>"{s.context.text}"</i></Text>
                        {s.replacements.length > 0 && (
                            <HStack spacing={2} mt={2} wrap="wrap">
                                <Text fontSize="sm" mr={2}>Replace with:</Text>
                                {s.replacements.slice(0, 5).map((r, j) => (
                                    <Button key={j} size="xs" colorScheme="purple" onClick={() => onApply(s, r.value)} m="1">
                                        {r.value}
                                    </Button>
                                ))}
                            </HStack>
                        )}
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};

export default SnippetEditor;