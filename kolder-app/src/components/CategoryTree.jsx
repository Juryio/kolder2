import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';

const CategoryItem = ({ category, onAdd, onEdit, onDelete, onSelectCategory, selectedCategory, settings }) => {
  const { isOpen, onToggle } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(category.name);

  const handleUpdate = () => {
    if(newName.trim() === '') {
        setNewName(category.name);
        setIsEditing(false);
        return;
    }
    onEdit(category.id, newName);
    setIsEditing(false);
  };

  const isSelected = selectedCategory === category.id;

  return (
    <Box pl="4" mt="2">
      <Flex align="center">
        <IconButton
          size="xs"
          mr="2"
          variant="ghost"
          icon={isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
          onClick={onToggle}
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
            onClick={() => onSelectCategory(category.id)}
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
          onClick={() => onAdd(category.id)}
        />
        <IconButton
          size="xs"
          ml="2"
          icon={<DeleteIcon />}
          onClick={() => onDelete(category.id)}
        />
      </Flex>
      <Collapse in={isOpen}>
        {category.children.map((child) => (
          <CategoryItem
            key={child.id}
            category={child}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelectCategory={onSelectCategory}
            selectedCategory={selectedCategory}
            settings={settings}
          />
        ))}
      </Collapse>
    </Box>
  );
};

const CategoryTree = ({ categories, onAdd, onEdit, onDelete, onSelectCategory, selectedCategory, settings }) => {
  return (
    <Box>
      <Flex align="center" mb="4">
        <Heading size="md">Categories</Heading>
        <Button size="sm" ml="auto" onClick={() => onAdd(null)} bg={settings?.theme.accentColor}>
          Add Category
        </Button>
      </Flex>
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectCategory={onSelectCategory}
          selectedCategory={selectedCategory}
          settings={settings}
        />
      ))}
    </Box>
  );
};

export default CategoryTree;
