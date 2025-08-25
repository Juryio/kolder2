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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Box,
} from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-quill/dist/quill.snow.css';
import './quill.css';

const Quill = ReactQuill.Quill;
const Inline = Quill.import('blots/inline');

class DatePlaceholderBlot extends Inline {
  static blotName = 'date-placeholder';
  static className = 'date-placeholder';
  static tagName = 'span';

  static create(value) {
    const node = super.create();
    // Sanitize value to prevent XSS
    node.setAttribute('data-variable', value);
    node.innerText = `{{${value}}}`;
    return node;
  }

  static formats(node) {
    return node.getAttribute('data-variable');
  }
}

Quill.register(DatePlaceholderBlot);


const SnippetEditor = ({ isOpen, onClose, onSave, snippet, settings }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [dateValues, setDateValues] = useState({});
  const [editingDate, setEditingDate] = useState(null); // { variable: string, target: DOMNode }
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

  useEffect(() => {
    if (!isOpen || !quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const editorRoot = quill.root;

    const handleClick = (e) => {
      const target = e.target;
      if (target && target.classList.contains('date-placeholder')) {
        e.preventDefault();
        e.stopPropagation();
        const variable = target.getAttribute('data-variable');
        setEditingDate({ variable, target });
      }
    };

    editorRoot.addEventListener('click', handleClick);

    return () => {
      editorRoot.removeEventListener('click', handleClick);
    };
  }, [isOpen]);

  const handleDateChange = (date) => {
    setDateValues((prev) => ({
      ...prev,
      [editingDate.variable]: date.toISOString(),
    }));
    setEditingDate(null);
  };

  const handleSave = () => {
    onSave({ ...snippet, name, content, dateValues });
    onClose();
  };

  const handleInsertPlaceholder = () => {
      const placeholderName = prompt('Enter placeholder name (e.g., customer_name):');
      if (placeholderName && placeholderName.trim() !== '') {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true); // true for focus
          // Using double braces as the primary format
          editor.insertText(range.index, `{{${placeholderName.trim()}}}`);
      }
  };

  const handleInsertDatePlaceholder = () => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);

    const existingDates = content.match(/{{date_(\d+)}}/g) || [];
    let nextId = 1;
    if (existingDates.length > 0) {
      const highestId = existingDates
        .map(p => parseInt(p.match(/\d+/)[0], 10))
        .reduce((max, id) => Math.max(max, id), 0);
      nextId = highestId + 1;
    }

    const variableName = `date_${nextId}`;
    editor.insertEmbed(range.index, 'date-placeholder', variableName, 'user');
    editor.setSelection(range.index + 1, Quill.sources.SILENT);
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
        <Popover
            isOpen={!!editingDate}
            onClose={() => setEditingDate(null)}
            placement="bottom-start"
            closeOnBlur={true}
            isLazy
        >
            <PopoverTrigger>
                <Box
                    position="absolute"
                    top={editingDate ? `${editingDate.target.offsetTop + editingDate.target.offsetHeight}px` : 0}
                    left={editingDate ? `${editingDate.target.offsetLeft}px` : 0}
                />
            </PopoverTrigger>
            <PopoverContent zIndex={9999} w="auto">
                <PopoverBody p={0}>
                    <DatePicker
                        selected={editingDate && dateValues[editingDate.variable] ? new Date(dateValues[editingDate.variable]) : null}
                        onChange={handleDateChange}
                        inline
                    />
                </PopoverBody>
            </PopoverContent>
        </Popover>
    </Modal>
  );
};

export default SnippetEditor;
