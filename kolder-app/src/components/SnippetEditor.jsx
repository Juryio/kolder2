import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Flex,
  HStack,
  Heading,
} from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-quill/dist/quill.snow.css';
import './quill.css';

const SnippetEditor = ({ isOpen, onClose, onSave, snippet, settings }) => {
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

  const handleInsertPlaceholder = () => {
      const placeholderName = prompt('Enter placeholder name (e.g., customer_name):');
      if (placeholderName && placeholderName.trim() !== '') {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertText(range.index, `{{${placeholderName.trim()}}}`);
      }
  };

  const handleInsertDatePlaceholder = () => {
    const name = prompt('Enter a name for the date variable (e.g., invoice_date):');
    if (!name || name.trim() === '') {
        return; // User cancelled or entered empty name
    }
    const sanitizedName = name.trim().replace(/\s+/g, '_'); // Replace spaces with underscores

    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    const variableName = `{{date:${sanitizedName}}}`;
    editor.insertText(range.index, variableName);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={settings?.theme.contentBackgroundColor} color={settings?.theme.textColor}>
        <ModalHeader>{snippet ? 'Edit Snippet' : 'New Snippet'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl>
                <Flex justify="space-between" align="center">
                    <FormLabel mb="0">Content</FormLabel>
                    <HStack>
                        <Button size="xs" onClick={handleInsertPlaceholder}>Insert Placeholder</Button>
                        <Button size="xs" onClick={handleInsertDatePlaceholder}>Insert Date</Button>
                    </HStack>
                </Flex>
                <ReactQuill ref={quillRef} theme="snow" value={content} onChange={setContent} style={{marginTop: '8px'}}/>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SnippetEditor;
