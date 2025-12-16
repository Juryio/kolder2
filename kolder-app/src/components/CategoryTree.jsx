import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Collapse,
} from '@chakra-ui/react';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ItemTypes } from '../utils/dnd-types';

/**
 * A single category in the tree, which can be dragged and dropped.
 * It recursively renders its children.
 * @param {object} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
const DraggableCategory = ({ category, onAdd, onEdit, onDelete, onSelectCategory, selectedCategory, settings, openCategories, onToggleCategory, onMove, onMoveSnippet }) => {
  const ref = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(category.name);

  const isOpen = !!openCategories[category._id];

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CATEGORY,
    item: { id: category._id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.CATEGORY, ItemTypes.SNIPPET],
    drop: (item, monitor) => {
      const itemType = monitor.getItemType();
      if (itemType === ItemTypes.CATEGORY && item.id !== category._id) {
        onMove(item.id, category._id);
      } else if (itemType === ItemTypes.SNIPPET) {
        onMoveSnippet(item.id, category._id);
      }
    },
    collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
    })
  }));

  drag(drop(ref));

  const handleUpdate = () => {
    if(newName.trim() === '') {
        setNewName(category.name);
    } else {
        onEdit(category._id, newName);
    }
    setIsEditing(false);
  };

  const handleNameClick = () => {
      onSelectCategory(category._id);
      onToggleCategory(category._id);
  }

  const isSelected = selectedCategory === category._id;

  return (
    <Box pl="4" mt="2" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Flex align="center" ref={ref} bg={isOver && canDrop ? 'green.100' : 'transparent'} borderRadius="md">
        <IconButton
          size="xs"
          mr="2"
          color={settings?.theme.textColor}
          variant="ghost"
          icon={isOpen ? <ChevronDownIcon width={16} height={16} /> : <ChevronRightIcon width={16} height={16} />}
          onClick={() => onToggleCategory(category._id)}
          visibility={category.children.length > 0 ? 'visible' : 'hidden'}
        />
        {isEditing ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleUpdate}
            onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
            size="sm"
          />
        ) : (
          <Heading
            id={`category-name-display-${category._id}`}
            size="sm"
            cursor="pointer"
            onDoubleClick={() => setIsEditing(true)}
            onClick={handleNameClick}
            bg={isSelected ? settings?.theme.accentColor : 'transparent'}
            p="1"
            borderRadius="md"
          >
            {category.name}
          </Heading>
        )}
        <IconButton
          size="xs"
          ml="2"
          icon={<PlusIcon width={16} height={16} />}
          onClick={() => onAdd(category._id)}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <IconButton
          size="xs"
          ml="2"
          icon={<TrashIcon width={16} height={16} />}
          onClick={() => onDelete(category._id)}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </Flex>
      <Collapse in={isOpen}>
        {category.children.map((child) => (
          <DraggableCategory
            key={child._id}
            category={child}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelectCategory={onSelectCategory}
            selectedCategory={selectedCategory}
            settings={settings}
            openCategories={openCategories}
            onToggleCategory={onToggleCategory}
            onMove={onMove}
            onMoveSnippet={onMoveSnippet}
          />
        ))}
      </Collapse>
    </Box>
  );
};

/**
 * A drop zone at the root of the category tree.
 * Allows users to drag categories to the root level.
 * @param {object} props - The component's props.
 * @param {function} props.onMove - Function to call when a category is dropped on the zone.
 * @returns {JSX.Element} The rendered component.
 */
const RootDropZone = ({ onMove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CATEGORY,
    drop: (item) => onMove(item.id, null),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <Box
      ref={drop}
      p={2}
      mt={2}
      mb={4}
      textAlign="center"
      border="2px dashed"
      borderColor={isOver ? 'green.500' : 'gray.500'}
      borderRadius="md"
      bg={isOver ? 'green.100' : 'transparent'}
    >
      Drop here to make a top-level category
    </Box>
  );
};

/**
 * The main component for the category tree.
 * Renders the tree of categories and the root drop zone.
 * @param {object} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
const CategoryTree = ({ categories, onAdd, onEdit, onDelete, onSelectCategory, selectedCategory, settings, openCategories, onToggleCategory, onMove, onMoveSnippet }) => {
  return (
    <Box>
      <Flex align="center" mb="4">
        <Button
            id="category-widget-add-button"
            size="sm"
            ml="auto"
            onClick={() => onAdd(null)}
            bgGradient={`linear(to-r, ${settings?.theme.accentColor}, purple.500)`}
            _hover={{
                bgGradient: `linear(to-r, ${settings?.theme.accentColor}, purple.600)`
            }}
        >
          Add Category
        </Button>
      </Flex>
      <RootDropZone onMove={onMove} />
      {categories.map((category) => (
        <DraggableCategory
          key={category._id}
          category={category}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectCategory={onSelectCategory}
          selectedCategory={selectedCategory}
          settings={settings}
          openCategories={openCategories}
          onToggleCategory={onToggleCategory}
          onMove={onMove}
          onMoveSnippet={onMoveSnippet}
        />
      ))}
    </Box>
  );
};

export default CategoryTree;
