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
} from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill.css';
import PlaceholderBuilderModal from './PlaceholderBuilderModal';

const SnippetEditor = ({ isOpen, onClose, onSave, snippet, settings }) => {
  const { isOpen: isBuilderOpen, onOpen: onBuilderOpen, onClose: onBuilderClose } = useDisclosure();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const quillRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (snippet) {
        setName(snippet.name);
        setContent(snippet.content);
      } else {
        setName('');
        setContent('');
      }
    }
  }, [snippet, isOpen]);

  const handleSave = () => {
    onSave({ ...snippet, name, content });
    onClose();
  };

  const handleInsertGeneratedPlaceholder = (placeholderString) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    if (range) {
        editor.insertText(range.index, placeholderString);
    }
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
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
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
