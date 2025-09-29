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
} from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill.css';
import PlaceholderBuilderModal from './PlaceholderBuilderModal';

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
  const quillRef = useRef(null);

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
  }, [snippet]);

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
                  <Button size="xs" onClick={onBuilderOpen}>Insert Placeholder</Button>
              </Flex>
              <ReactQuill ref={quillRef} theme="snow" value={content} onChange={setContent} style={{marginTop: '8px'}}/>
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
      </Box>
      <PlaceholderBuilderModal
        isOpen={isBuilderOpen}
        onClose={onBuilderClose}
        onInsert={handleInsertGeneratedPlaceholder}
      />
    </>
  );
};

export default SnippetEditor;
