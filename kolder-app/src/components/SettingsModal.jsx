import { useState, useEffect, useRef } from 'react';
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
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';

/**
 * A modal dialog for editing application settings.
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to call when the modal is closed.
 * @param {function} props.onSave - Function to call when the user saves the settings. It receives the new settings object as an argument.
 * @param {object} props.settings - The current application settings.
 * @returns {JSX.Element} The rendered component.
 */
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

  /**
   * Handles changes to the main settings fields (title, icon).
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles changes to the theme color fields.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
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

  /**
   * Handles the click on the "Save" button.
   * Calls the onSave prop and closes the modal.
   */
  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/debug/export');
      const data = JSON.stringify(response.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kolder-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export data.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        await axios.post('/api/debug/import', data);
        toast({
          title: 'Import Successful',
          description: 'Data has been imported. Please refresh the page to see the changes.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          title: 'Import Failed',
          description: 'Could not import data. Please ensure the file is a valid export.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    reader.readAsText(file);
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
            <Heading size="sm" mt={4} alignSelf="flex-start">Data Management</Heading>
            <Button onClick={handleExport}>Export Data</Button>
            <Button as="label" htmlFor="import-file">
              Import Data
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                display="none"
              />
            </Button>
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
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
