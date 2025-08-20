import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';

const SettingsModal = ({ isOpen, onClose, onSave, settings }) => {
  const [currentSettings, setCurrentSettings] = useState({ title: '', icon: '', backgroundColor: '' });

  useEffect(() => {
    if (settings) {
      setCurrentSettings(settings);
    }
  }, [settings, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Application Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Application Title</FormLabel>
              <Input
                name="title"
                value={currentSettings.title}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Icon URL</FormLabel>
              <Input
                name="icon"
                value={currentSettings.icon}
                onChange={handleChange}
                placeholder="Enter URL for favicon"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Background Color</FormLabel>
              <Input
                name="backgroundColor"
                value={currentSettings.backgroundColor}
                onChange={handleChange}
                placeholder="e.g., #FFFFFF"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
