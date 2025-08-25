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
} from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-quill/dist/quill.snow.css';
import './quill.css';

// A new sub-component to manage the date variables UI
const DateManager = ({ content, dateValues, onDateChange }) => {
    const datePlaceholderRegex = /{{(date_\d+)}}/g;
    const found = content.matchAll(datePlaceholderRegex);
    const uniqueDateVars = [...new Set(Array.from(found, match => match[1]))];

    if (uniqueDateVars.length === 0) {
        return null;
    }

    return (
        <VStack spacing={4} align="stretch" mt={4}>
            <Heading size="sm">Date Variables</Heading>
            {uniqueDateVars.map(varName => (
                <FormControl key={varName}>
                    <Flex align="center" justify="space-between">
                        <FormLabel htmlFor={varName} mb="0">{varName}</FormLabel>
                        <DatePicker
                            id={varName}
                            selected={dateValues[varName] ? new Date(dateValues[varName]) : null}
                            onChange={date => onDateChange(varName, date)}
                            customInput={<Input w="150px" />}
                            dateFormat="yyyy-MM-dd"
                            isClearable
                        />
                    </Flex>
                </FormControl>
            ))}
        </VStack>
    );
};


const SnippetEditor = ({ isOpen, onClose, onSave, snippet, settings }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [dateValues, setDateValues] = useState({});
  const quillRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (snippet) {
        setName(snippet.name);
        setContent(snippet.content);
        setDateValues(snippet.dateValues || {});
      } else {
        setName('');
        setContent('');
        setDateValues({});
      }
    }
  }, [snippet, isOpen]);

  const handleSave = () => {
    onSave({ ...snippet, name, content, dateValues });
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
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);

    // Get the current content directly from the editor to avoid stale state
    const currentContent = editor.getText();
    const existingDates = currentContent.match(/{{date_(\d+)}}/g) || [];
    let nextId = 1;
    if (existingDates.length > 0) {
      const highestId = existingDates
        .map(p => parseInt(p.match(/(\d+)/)[0], 10))
        .reduce((max, id) => Math.max(max, id), 0);
      nextId = highestId + 1;
    }

    const variableName = `{{date_${nextId}}}`;
    editor.insertText(range.index, variableName);
  };

  const handleDateChange = (variableName, date) => {
    setDateValues(prev => ({
      ...prev,
      [variableName]: date ? date.toISOString() : null,
    }));
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
            <DateManager
                content={content}
                dateValues={dateValues}
                onDateChange={handleDateChange}
            />
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
