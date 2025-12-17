import { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../utils/dnd-types';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  IconButton,
  Input,
  Wrap,
  WrapItem,
  Tag,
  useStyleConfig,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import SnippetEditor from './SnippetEditor';

/**
 * Recursively finds the path of a category by its ID.
 * @param {string} id - The ID of the category to find.
 * @param {Array<object>} categories - The list of categories to search in.
 * @param {Array<string>} path - The current path.
 * @returns {string | null} The path of the category, or null if not found.
 */
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

/**
 * A single snippet item in the list, which can be dragged.
 * @param {object} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
const DraggableSnippetItem = ({ snippet, categories, onSelectSnippet, onEdit, onDelete, settings, isSearching }) => {
    const ref = useRef(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.SNIPPET,
        item: { id: snippet._id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    const styles = useStyleConfig('SnippetItem');

    drag(ref);

    return (
        <Flex
            ref={ref}
            key={snippet._id}
            align="center"
            justify="space-between"
            p={3}
            borderRadius="md"
            mt={2}
            style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
            __css={styles}
        >
            <Box flex="1" mr={2}>
                <Text fontWeight="bold" cursor="pointer" onClick={() => onSelectSnippet(snippet)}>{snippet.name}</Text>
                {isSearching && (
                    <Text fontSize="xs" color="gray.500" mb={1}>
                        in: {getCategoryPath(snippet.categoryId, categories)}
                    </Text>
                )}
                {snippet.tags && snippet.tags.length > 0 && (
                    <Wrap mt={2}>
                        {snippet.tags.map(tag => (
                            <WrapItem key={tag}>
                                <Tag size="sm" variant="solid" colorScheme="purple">
                                    {tag}
                                </Tag>
                            </WrapItem>
                        ))}
                    </Wrap>
                )}
            </Box>
            <Box>
                <IconButton size="sm" icon={<EditIcon />} mr="2" onClick={() => onEdit(snippet)} onMouseDown={(e) => e.stopPropagation()} variant="glass" />
                <IconButton size="sm" icon={<DeleteIcon />} onClick={() => onDelete(snippet._id)} onMouseDown={(e) => e.stopPropagation()} variant="glass" />
            </Box>
        </Flex>
    );
}

/**
 * A component that displays a list of snippets.
 * @param {object} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
const SnippetList = ({ snippets, categories, searchTerm, onSearchChange, onAdd, onEdit, onDelete, onSelectSnippet, settings }) => {
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Handles the click on the "New Snippet" button.
   */
  const handleNew = () => {
    setEditingSnippet(null);
    setIsEditing(true);
  };

  /**
   * Handles the click on the "Edit" button for a snippet.
   * @param {object} snippet - The snippet to edit.
   */
  const handleEdit = (snippet) => {
    setEditingSnippet(snippet);
    setIsEditing(true);
  };

  /**
   * Handles saving a new or edited snippet.
   * @param {object} snippet - The snippet to save.
   */
  const handleSave = (snippet) => {
    if (snippet._id) {
      onEdit(snippet);
    } else {
      onAdd(snippet);
    }
    setIsEditing(false);
  };

  /**
   * Handles canceling the editing of a snippet.
   */
  const handleCancel = () => {
    setIsEditing(false);
  };

  const isSearching = searchTerm !== '';

  if (isEditing) {
    return (
      <SnippetEditor
        onClose={handleCancel}
        onSave={handleSave}
        snippet={editingSnippet}
        settings={settings}
      />
    );
  }

  return (
    <Box>
      <Flex align="center" mb="4">
        <Button
            id="snippet-list-new-snippet-button"
            size="sm"
            ml="auto"
            leftIcon={<AddIcon />}
            onClick={handleNew}
            disabled={isSearching}
        >
          New Snippet
        </Button>
      </Flex>
      
      {snippets.length === 0 ? (
        <Text>
            {isSearching
                ? 'No snippets match your search.'
                : 'No snippets in this category. Select a category or use the search bar.'
            }
        </Text>
      ) : (
        snippets.map((snippet) => (
          <DraggableSnippetItem
            key={snippet._id}
            snippet={snippet}
            categories={categories}
            onSelectSnippet={onSelectSnippet}
            onEdit={handleEdit}
            onDelete={onDelete}
            settings={settings}
            isSearching={isSearching}
          />
        ))
      )}
    </Box>
  );
};

export default SnippetList;
