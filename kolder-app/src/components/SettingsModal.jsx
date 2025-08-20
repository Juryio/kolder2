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
  Heading,
} from '@chakra-ui/react';

const SettingsModal = ({ isOpen, onClose, onSave, settings }) => {
  const [currentSettings, setCurrentSettings] = useState({ title: '', icon: '', theme: { backgroundColor: '', contentBackgroundColor: '', textColor: '', accentColor: '' } });

  useEffect(() => {
    if (settings) {
      // Ensure theme object exists to avoid errors
      setCurrentSettings({
        ...settings,
        theme: settings.theme || { backgroundColor: '', contentBackgroundColor: '', textColor: '', accentColor: '' }
      });
    }
  }, [settings, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (e) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({
        ...prev,
        theme: {
            ...prev.theme,
            [name]: value,
        }
    }));
  }

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={currentSettings.theme?.contentBackgroundColor} color={currentSettings.theme?.textColor}>
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
            <Heading size="sm" mt={4} alignSelf="flex-start">Theme Colors</Heading>
             <FormControl>
              <FormLabel>Main Background</FormLabel>
              <Input name="backgroundColor" value={currentSettings.theme.backgroundColor} onChange={handleThemeChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Content Background</FormLabel>
              <Input name="contentBackgroundColor" value={currentSettings.theme.contentBackgroundColor} onChange={handleThemeChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Text Color</FormLabel>
              <Input name="textColor" value={currentSettings.theme.textColor} onChange={handleThemeChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Accent Color</FormLabel>
              <Input name="accentColor" value={currentSettings.theme.accentColor} onChange={handleThemeChange} />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button bg={currentSettings.theme.accentColor} mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
