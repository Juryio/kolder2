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
  Select,
  VStack,
} from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill.css'; // Import custom Quill styles
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

const SnippetEditor = ({ isOpen, onClose, onSave, snippet, settings }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [startingSnippets, setStartingSnippets] = useState([]);
  const quillRef = useRef(null); // Ref to access Quill editor instance

  // Fetch starting snippets when modal opens
  useEffect(() => {
    if (isOpen) {
        api.get('/starting-snippets')
           .then(response => setStartingSnippets(response.data))
           .catch(error => console.error('Error fetching starting snippets', error));
    }
  }, [isOpen]);

  // Populate editor when snippet is being edited
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

  const handleStartingSnippetChange = (e) => {
    const snippetId = e.target.value;
    const selected = startingSnippets.find(ss => ss._id === snippetId);
    if (selected) {
        // Prepend the content
        const newContent = selected.content + '<p><br></p>' + content;
        setContent(newContent);

        // Focus the editor
        if (quillRef.current) {
            quillRef.current.getEditor().focus();
        }
    }
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
                    <FormLabel>Insert Starting Snippet</FormLabel>
                    <Select placeholder="Select a starting snippet..." onChange={handleStartingSnippetChange}>
                        {startingSnippets.map(ss => (
                            <option key={ss._id} value={ss._id}>{ss.name}</option>
                        ))}
                    </Select>
                </FormControl>
                <FormControl>
                    <FormLabel>Content</FormLabel>
                    <ReactQuill ref={quillRef} theme="snow" value={content} onChange={setContent} />
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
