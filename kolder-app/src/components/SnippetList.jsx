import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import SnippetEditor from './SnippetEditor';

const SnippetList = ({ snippets, selectedCategory, onAdd, onEdit, onDelete, onSelectSnippet }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSnippet, setEditingSnippet] = useState(null);

  const handleNew = () => {
    setEditingSnippet(null);
    onOpen();
  };

  const handleEdit = (snippet) => {
    setEditingSnippet(snippet);
    onOpen();
  };

  const handleSave = (snippet) => {
    if (snippet.id) {
      onEdit(snippet);
    } else {
      onAdd(snippet);
    }
  };

  if (!selectedCategory) {
    return (
      <Box>
        <Heading size="md">Snippets</Heading>
        <Text mt="4">Select a category to see its snippets.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex align="center" mb="4">
        <Heading size="md">Snippets</Heading>
        <Button size="sm" ml="auto" leftIcon={<AddIcon />} onClick={handleNew}>
          New Snippet
        </Button>
      </Flex>
      {snippets.length === 0 ? (
        <Text>No snippets in this category.</Text>
      ) : (
        snippets.map((snippet) => (
          <Flex key={snippet.id} align="center" justify="space-between" p="2" borderWidth="1px" borderRadius="md" mt="2">
            <Text cursor="pointer" onClick={() => onSelectSnippet(snippet)}>{snippet.name}</Text>
            <Box>
              <IconButton size="sm" icon={<EditIcon />} mr="2" onClick={() => handleEdit(snippet)} />
              <IconButton size="sm" icon={<DeleteIcon />} onClick={() => onDelete(snippet.id)} />
            </Box>
          </Flex>
        ))
      )}
      <SnippetEditor
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSave}
        snippet={editingSnippet}
      />
    </Box>
  );
};

export default SnippetList;
