import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  RadioGroup,
  Radio,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

/**
 * A modal dialog for building placeholder strings.
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to call when the modal is closed.
 * @param {function} props.onInsert - Function to call when the user inserts a placeholder. It receives the placeholder string as an argument.
 * @returns {JSX.Element} The rendered component.
 */
const PlaceholderBuilderModal = ({ isOpen, onClose, onInsert }) => {
  const [type, setType] = useState('text'); // 'text', 'date', 'choice'
  const [name, setName] = useState('');
  const [options, setOptions] = useState(['']);
  const [displayType, setDisplayType] = useState('dropdown');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setType('text');
      setName('');
      setOptions(['']);
      setDisplayType('dropdown');
    }
  }, [isOpen]);

  /**
   * Handles the click on the "Insert" button.
   * Builds the placeholder string and calls the onInsert prop.
   */
  const handleInsert = () => {
    if (!name.trim()) {
        // Basic validation
        alert('Placeholder Name is required.');
        return;
    }

    let placeholderString = '';
    const sanitizedName = name.trim().replace(/\s+/g, '_');

    switch (type) {
        case 'text':
            placeholderString = `{{${sanitizedName}}}`;
            break;
        case 'date':
            placeholderString = `{{date:${sanitizedName}}}`;
            break;
        case 'choice': {
            const validOptions = options.map(o => o.trim()).filter(o => o);
            if (validOptions.length === 0) {
                alert('At least one option is required for a choice placeholder.');
                return;
            }
            placeholderString = `{{select:${sanitizedName}:${displayType}:${validOptions.join(':')}}}`;
            break;
        }
        default:
            return; // Should not happen
    }

    onInsert(placeholderString);
    onClose();
  };

  /**
   * Renders the configuration UI for the selected placeholder type.
   * @returns {JSX.Element | null} The UI for configuring the placeholder.
   */
  const renderConfigUI = () => {
    switch (type) {
      case 'text':
      case 'date':
        return (
          <FormControl isRequired>
            <FormLabel>Placeholder Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'date' ? 'e.g., invoice_date' : 'e.g., customer_name'}
            />
          </FormControl>
        );
      case 'choice':
        return (
            <>
                <FormControl isRequired>
                    <FormLabel>Placeholder Name</FormLabel>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., salutation" />
                </FormControl>
                <FormControl>
                    <FormLabel>Display Style</FormLabel>
                    <RadioGroup onChange={setDisplayType} value={displayType}>
                        <HStack>
                            <Radio value="dropdown">Dropdown</Radio>
                            <Radio value="radio">Radio Buttons</Radio>
                        </HStack>
                    </RadioGroup>
                </FormControl>
                <FormControl>
                    <FormLabel>Options</FormLabel>
                    <VStack align="stretch">
                        {options.map((option, index) => (
                            <HStack key={index}>
                                <Input
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                />
                                <IconButton
                                    icon={<DeleteIcon />}
                                    onClick={() => removeOption(index)}
                                    aria-label="Remove option"
                                    isDisabled={options.length <= 1}
                                />
                            </HStack>
                        ))}
                    </VStack>
                    <Button size="sm" mt={2} leftIcon={<AddIcon />} onClick={addOption}>Add Option</Button>
                </FormControl>
            </>
        )
      default:
        return null;
    }
  };

  /**
   * Handles changes to the choice options.
   * @param {number} index - The index of the option to change.
   * @param {string} value - The new value of the option.
   */
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  /**
   * Adds a new empty option for a choice placeholder.
   */
  const addOption = () => {
    setOptions([...options, '']);
  };

  /**
   * Removes an option for a choice placeholder.
   * @param {number} index - The index of the option to remove.
   */
  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Placeholder Builder</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Placeholder Type</FormLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="text">Text Input</option>
                <option value="date">Date</option>
                <option value="choice">Choice (Dropdown/Radio)</option>
              </Select>
            </FormControl>
            {renderConfigUI()}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleInsert}>
            Insert
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PlaceholderBuilderModal;
