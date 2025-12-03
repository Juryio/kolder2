import React from 'react';
import {
  Tag,
  TagLabel,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  FormControl,
  FormLabel,
  Input,
  Select,
} from '@chakra-ui/react';
import { NodeViewWrapper } from '@tiptap/react';

const PlaceholderChip = ({ node, updateAttributes }) => {
  const { name, type } = node.attrs;

  const handleNameChange = (e) => {
    updateAttributes({ name: e.target.value });
  };

  const handleTypeChange = (e) => {
    updateAttributes({ type: e.target.value });
  };

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline-block' }}>
      <Popover>
        <PopoverTrigger>
          <Tag
            colorScheme="purple"
            variant="solid"
            borderRadius="full"
            mx="1"
            cursor="pointer"
            _hover={{
              transform: 'scale(1.05)',
            }}
            transition="transform 0.1s ease-in-out"
          >
            <TagLabel>{name}</TagLabel>
          </Tag>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Edit Placeholder</PopoverHeader>
          <PopoverBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={handleNameChange} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Type</FormLabel>
              <Select value={type} onChange={handleTypeChange}>
                <option value="text">Text</option>
                <option value="checkbox">Checkbox</option>
                <option value="dropdown">Dropdown</option>
                <option value="date">Date</option>
              </Select>
            </FormControl>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </NodeViewWrapper>
  );
};

export default PlaceholderChip;
