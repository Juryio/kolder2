import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const SnippetEditor = ({ isOpen, onClose, onSave, snippet }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  // When the modal opens, if we are editing a snippet, populate the fields
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{snippet ? 'Edit Snippet' : 'New Snippet'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl mt="4">
            <FormLabel>Content</FormLabel>
            <ReactQuill theme="snow" value={content} onChange={setContent} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SnippetEditor;
