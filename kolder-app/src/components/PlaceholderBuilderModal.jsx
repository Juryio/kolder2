import { useState, useEffect } from 'react';
import axios from 'axios';
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
  NumberInput,
  NumberInputField,
  Text,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const PlaceholderBuilderModal = ({ isOpen, onClose, onInsert }) => {
  const [type, setType] = useState('text');
  const [name, setName] = useState('');
  const [options, setOptions] = useState(['']);
  const [displayType, setDisplayType] = useState('dropdown');
  const [dateMods, setDateMods] = useState([]);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType('text');
      setName('');
      setOptions(['']);
      setDisplayType('dropdown');
      setDateMods([]);
    }
  }, [isOpen]);

  const handleInsert = () => {
    if (!name.trim()) {
      alert('Placeholder Name is required.');
      return;
    }

    let placeholderString = '';
    const sanitizedName = name.trim().replace(/\s+/g, '_');

    switch (type) {
      case 'text':
        placeholderString = `{{${sanitizedName}}}`;
        break;
      case 'date': {
        const modsString = dateMods.map(mod => `${mod.operator}${mod.amount}${mod.unit}`).join('');
        placeholderString = `{{date:${sanitizedName}${modsString}}}`;
        break;
      }
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
        return;
    }

    onInsert(placeholderString);
    onClose();
  };

  const openSaveModal = () => {
    if (!name.trim()) {
      alert('Placeholder Name is required to save a template.');
      return;
    }
    setSaveModalOpen(true);
  };

  const closeSaveModal = () => {
    setSaveModalOpen(false);
    setTemplateName('');
    setTemplateDescription('');
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Template Name is required.');
      return;
    }

    let config = {
      name: name.trim().replace(/\s+/g, '_'),
    };

    if (type === 'date') {
        const modsString = dateMods.map(mod => `${mod.operator}${mod.amount}${mod.unit}`).join('');
        // We save the modified name in the config for the template
        config.name = `${config.name}${modsString}`;
    } else if (type === 'choice') {
      const validOptions = options.map(o => o.trim()).filter(o => o);
      if (validOptions.length === 0) {
        alert('At least one option is required for a choice placeholder.');
        return;
      }
      config.displayType = displayType;
      config.options = validOptions;
    }

    // When saving a date template, the name in the DB will include modifications.
    // e.g., 'invoice_date+29d'
    const templateData = {
      name: templateName,
      description: templateDescription,
      type: type,
      config: config
    };

    try {
      await axios.post('/api/placeholder-templates', templateData);
      closeSaveModal();
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please check the console for details.');
    }
  };


  const addDateMod = () => {
    setDateMods([...dateMods, { operator: '+', amount: 1, unit: 'd' }]);
  };

  const removeDateMod = (index) => {
    setDateMods(dateMods.filter((_, i) => i !== index));
  };

  const handleDateModChange = (index, field, value) => {
    const newMods = [...dateMods];
    newMods[index][field] = value;
    setDateMods(newMods);
  };

  const renderConfigUI = () => {
    switch (type) {
      case 'text':
        return (
          <FormControl isRequired>
            <FormLabel>Placeholder Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., customer_name"
            />
          </FormControl>
        );
      case 'date':
        return (
          <>
            <FormControl isRequired>
              <FormLabel>Base Date Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., invoice_date"
              />
            </FormControl>
            <FormControl>
                <FormLabel>Date Modifications</FormLabel>
                <VStack align="stretch" spacing={2}>
                    {dateMods.map((mod, index) => (
                        <HStack key={index}>
                            <Select value={mod.operator} onChange={(e) => handleDateModChange(index, 'operator', e.target.value)} w="80px">
                                <option value="+">+</option>
                                <option value="-">-</option>
                            </Select>
                            <NumberInput value={mod.amount} onChange={(val) => handleDateModChange(index, 'amount', parseInt(val) || 0)} min={0} w="100px">
                                <NumberInputField />
                            </NumberInput>
                            <Select value={mod.unit} onChange={(e) => handleDateModChange(index, 'unit', e.target.value)} w="120px">
                                <option value="d">Days</option>
                                <option value="w">Weeks</option>
                                <option value="m">Months</option>
                                <option value="y">Years</option>
                            </Select>
                            <IconButton icon={<DeleteIcon />} onClick={() => removeDateMod(index)} aria-label="Remove modification" />
                        </HStack>
                    ))}
                </VStack>
                <Button size="sm" mt={2} leftIcon={<AddIcon />} onClick={addDateMod}>Add Modification</Button>
            </FormControl>
          </>
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
        );
      default:
        return null;
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Placeholder Builder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Placeholder Type</FormLabel>
                <Select value={type} onChange={(e) => { setType(e.target.value); setDateMods([]); }}>
                  <option value="text">Text Input</option>
                  <option value="date">Date</option>
                  <option value="choice">Choice (Dropdown/Radio)</option>
                </Select>
              </FormControl>
              {renderConfigUI()}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={openSaveModal}>
              Save as Template
            </Button>
            <Button colorScheme="blue" mr={3} onClick={handleInsert}>
              Insert
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isSaveModalOpen} onClose={closeSaveModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Placeholder Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Template Name</FormLabel>
                <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g., Anrede Radio Buttons" />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} placeholder="A brief description" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveTemplate}>
              Save
            </Button>
            <Button onClick={closeSaveModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PlaceholderBuilderModal;
