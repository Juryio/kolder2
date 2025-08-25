import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  IconButton,
  useDisclosure,
  Input,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import SnippetEditor from './SnippetEditor';

const getCategoryPath = (id, categories, path = []) => {
    for (const category of categories) {
        const newPath = [...path, category.name];
        if (category._id === id) {
            return newPath.join(' / ');
        }
        if (category.children && category.children.length > 0) {
            const foundPath = getCategoryPath(id, category.children, newPath);
            if (foundPath) return foundPath;
        }
    }
    return null;
};

const SnippetList = ({ snippets, categories, searchTerm, onSearchChange, onAdd, onEdit, onDelete, onSelectSnippet, settings }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    // Sync local state if the external searchTerm changes (e.g., cleared)
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleNew = () => {
    setEditingSnippet(null);
    onOpen();
  };

  const handleEdit = (snippet) => {
    setEditingSnippet(snippet);
    onOpen();
  };

  const handleSave = (snippet) => {
    if (snippet._id) {
      onEdit(snippet);
    } else {
      onAdd(snippet);
    }
  };

  const handleSearchInputChange = (e) => {
    setLocalSearchTerm(e.target.value);
    onSearchChange(e.target.value);
  }

  const isSearching = searchTerm !== '';

  return (
    <Box>
      <Flex align="center" mb="4">
        <Heading size="md">{isSearching ? `Search Results for "${searchTerm}"` : 'Snippets'}</Heading>
        <Button
            size="sm"
            ml="auto"
            leftIcon={<AddIcon />}
            onClick={handleNew}
            disabled={isSearching}
            bgGradient={`linear(to-r, ${settings?.theme.accentColor}, purple.500)`}
            _hover={{
                bgGradient: `linear(to-r, ${settings?.theme.accentColor}, purple.600)`
            }}
        >
          New Snippet
        </Button>
      </Flex>
      <Input
        placeholder="Search all snippets..."
        value={localSearchTerm}
        onChange={handleSearchInputChange}
        mb={4}
      />
      {snippets.length === 0 ? (
        <Text>
            {isSearching
                ? 'No snippets match your search.'
                : 'No snippets in this category. Select a category or use the search bar.'
            }
        </Text>
      ) : (
        snippets.map((snippet) => (
          <Flex key={snippet._id} align="center" justify="space-between" p={3} bg={settings?.theme.contentBackgroundColor} borderWidth="1px" borderColor={settings?.theme.accentColor} borderRadius="md" mt={2}>
            <Box>
                <Text fontWeight="bold" cursor="pointer" onClick={() => onSelectSnippet(snippet)}>{snippet.name}</Text>
                {isSearching && (
                    <Text fontSize="xs" color="gray.500">
                        in: {getCategoryPath(snippet.categoryId, categories)}
                    </Text>
                )}
            </Box>
            <Box>
              <IconButton size="sm" icon={<EditIcon />} mr="2" onClick={() => handleEdit(snippet)} />
              <IconButton size="sm" icon={<DeleteIcon />} onClick={() => onDelete(snippet._id)} />
            </Box>
          </Flex>
        ))
      )}
      <SnippetEditor
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSave}
        snippet={editingSnippet}
        settings={settings}
      />
    </Box>
  );
};

export default SnippetList;
