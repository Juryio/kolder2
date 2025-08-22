import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Collapse,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';

const CategoryItem = ({ category, onAdd, onEdit, onDelete, onSelectCategory, selectedCategory, settings, openCategories, onToggleCategory }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(category.name);

  const isOpen = !!openCategories[category._id];

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
    <Box pl="4" mt="2">
      <Flex align="center">
        <IconButton
          size="xs"
          mr="2"
          color={settings?.theme.textColor}
          variant="ghost"
          icon={isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
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
          icon={<AddIcon />}
          onClick={() => onAdd(category._id)}
        />
        <IconButton
          size="xs"
          ml="2"
          icon={<DeleteIcon />}
          onClick={() => onDelete(category._id)}
        />
      </Flex>
      <Collapse in={isOpen}>
        {category.children.map((child) => (
          <CategoryItem
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
          />
        ))}
      </Collapse>
    </Box>
  );
};

const CategoryTree = ({ categories, onAdd, onEdit, onDelete, onSelectCategory, selectedCategory, settings, openCategories, onToggleCategory }) => {
  return (
    <Box>
      <Flex align="center" mb="4">
        <Heading size="md">Categories</Heading>
        <Button
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
      {categories.map((category) => (
        <CategoryItem
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
        />
      ))}
    </Box>
  );
};

export default CategoryTree;
