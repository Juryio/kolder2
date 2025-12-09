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
  Switch,
  HStack,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
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
  const [currentSettings, setCurrentSettings] = useState({ title: '', icon: '', theme: { backgroundColor: '', contentBackgroundColor: '', textColor: '', accentColor: '', gradientColor1: '', gradientColor2: '', gradientColor3: '', animationEnabled: true, animationSpeed: 30, animationType: 'rotate', customBackground: '', backgroundType: 'default', vantaBackgroundColor: '#000000', vantaLineColor: '#ffffff', vantaAnimationEnabled: true }, languageToolEnabled: false, languageToolApiUrl: '', languageToolLanguage: 'auto' });
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (settings) {
      const themeDefaults = {
        backgroundColor: '', contentBackgroundColor: '', textColor: '', accentColor: '',
        gradientColor1: '', gradientColor2: '', gradientColor3: '',
        animationEnabled: true, animationSpeed: 30, animationType: 'rotate',
        customBackground: '', backgroundType: 'default',
        vantaBackgroundColor: '#000000', vantaLineColor: '#ffffff', vantaAnimationEnabled: true
      };
      // Ensure theme object exists to avoid errors
      setCurrentSettings({
        ...settings,
        theme: { ...themeDefaults, ...(settings.theme || {}) },
        languageToolEnabled: settings.languageToolEnabled || false,
        languageToolApiUrl: settings.languageToolApiUrl || '',
        languageToolLanguage: settings.languageToolLanguage || 'auto',
      });
    }
  }, [settings, isOpen]);

  /**
   * Handles changes to the main settings fields (title, icon).
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  /**
   * Handles changes to the theme color fields.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleThemeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentSettings(prev => ({
        ...prev,
        theme: {
            ...prev.theme,
            [name]: type === 'checkbox' ? checked : value,
        }
    }));
  }

  const handleAnimationSpeedChange = (value) => {
    setCurrentSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        animationSpeed: value,
      }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentSettings(prev => ({
          ...prev,
          theme: {
            ...prev.theme,
            customBackground: reader.result,
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomBackground = () => {
    setCurrentSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        customBackground: '',
      }
    }));
  };

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
            <Button onClick={handleExport} data-testid="export-button">Export Data</Button>
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
            <Heading size="sm" mt={4} alignSelf="flex-start">LanguageTool Settings</Heading>
            <FormControl>
                <HStack>
                    <FormLabel htmlFor='languageToolEnabled' mb='0'>
                        Enable LanguageTool
                    </FormLabel>
                    <Switch
                        id='languageToolEnabled'
                        name='languageToolEnabled'
                        isChecked={currentSettings.languageToolEnabled}
                        onChange={handleChange}
                    />
                </HStack>
            </FormControl>
            <FormControl>
              <FormLabel>LanguageTool API URL</FormLabel>
              <Input
                name="languageToolApiUrl"
                value={currentSettings.languageToolApiUrl}
                onChange={handleChange}
                placeholder="e.g., http://localhost:8010/v2/check"
                isDisabled={!currentSettings.languageToolEnabled}
              />
            </FormControl>
            <FormControl>
              <FormLabel>LanguageTool Language</FormLabel>
              <Input
                name="languageToolLanguage"
                value={currentSettings.languageToolLanguage}
                onChange={handleChange}
                placeholder="e.g., en-US, de-DE, auto"
                isDisabled={!currentSettings.languageToolEnabled}
              />
            </FormControl>
            <Heading size="sm" mt={4} alignSelf="flex-start">Theme Colors</Heading>
            <FormControl>
              <FormLabel>Main Background</FormLabel>
              <Input type="color" name="backgroundColor" value={currentSettings.theme.backgroundColor} onChange={handleThemeChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Content Background</FormLabel>
              <Input type="color" name="contentBackgroundColor" value={currentSettings.theme.contentBackgroundColor} onChange={handleThemeChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Text Color</FormLabel>
              <Input type="color" name="textColor" value={currentSettings.theme.textColor} onChange={handleThemeChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Accent Color</FormLabel>
              <Input type="color" name="accentColor" value={currentSettings.theme.accentColor} onChange={handleThemeChange} />
            </FormControl>


            <Heading size="sm" mt={4} alignSelf="flex-start">Background Type</Heading>
            <FormControl>
              <Select name="backgroundType" value={currentSettings.theme.backgroundType} onChange={handleThemeChange}>
                <option value="default">Default</option>
                <option value="animated">Animated Gradient</option>
                <option value="custom">Custom Image</option>
                <option value="vanta">Vanta NET</option>
              </Select>
            </FormControl>

            {currentSettings.theme.backgroundType === 'animated' && (
              <>
                <Heading size="sm" mt={4} alignSelf="flex-start">Animated Background</Heading>
                <FormControl>
                  <HStack>
                    <FormLabel htmlFor='animationEnabled' mb='0'>
                      Enable Animation
                    </FormLabel>
                    <Switch
                      id='animationEnabled'
                      name='animationEnabled'
                      isChecked={currentSettings.theme.animationEnabled}
                      onChange={handleThemeChange}
                    />
                  </HStack>
                </FormControl>
                <FormControl>
                  <FormLabel>Gradient Color 1</FormLabel>
                  <Input type="color" name="gradientColor1" value={currentSettings.theme.gradientColor1} onChange={handleThemeChange} isDisabled={!currentSettings.theme.animationEnabled} />
                </FormControl>
                <FormControl>
                  <FormLabel>Gradient Color 2</FormLabel>
                  <Input type="color" name="gradientColor2" value={currentSettings.theme.gradientColor2} onChange={handleThemeChange} isDisabled={!currentSettings.theme.animationEnabled} />
                </FormControl>
                <FormControl>
                  <FormLabel>Gradient Color 3</FormLabel>
                  <Input type="color" name="gradientColor3" value={currentSettings.theme.gradientColor3} onChange={handleThemeChange} isDisabled={!currentSettings.theme.animationEnabled} />
                </FormControl>
                <FormControl>
                  <FormLabel>Animation Type</FormLabel>
                  <Select name="animationType" value={currentSettings.theme.animationType} onChange={handleThemeChange} isDisabled={!currentSettings.theme.animationEnabled}>
                    <option value="rotate">Rotate</option>
                    <option value="pan">Pan</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Animation Speed ({currentSettings.theme.animationSpeed}s)</FormLabel>
                  <Slider
                    aria-label="animation-speed-slider"
                    defaultValue={currentSettings.theme.animationSpeed}
                    min={5}
                    max={60}
                    onChangeEnd={handleAnimationSpeedChange}
                    isDisabled={!currentSettings.theme.animationEnabled}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>
              </>
            )}

            {currentSettings.theme.backgroundType === 'custom' && (
              <>
                <Heading size="sm" mt={4} alignSelf="flex-start">Custom Background</Heading>
                <FormControl>
                  <FormLabel>Upload Image</FormLabel>
                  <Input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} display="none" />
                  <Button onClick={() => fileInputRef.current.click()}>Choose File</Button>
                  {currentSettings.theme.customBackground && (
                    <Button ml={2} onClick={removeCustomBackground}>Remove Image</Button>
                  )}
                </FormControl>
              </>
            )}

            {currentSettings.theme.backgroundType === 'vanta' && (
              <>
                <Heading size="sm" mt={4} alignSelf="flex-start">Vanta NET Settings</Heading>
                 <FormControl>
                  <HStack>
                    <FormLabel htmlFor='vantaAnimationEnabled' mb='0'>
                      Enable Animation
                    </FormLabel>
                    <Switch
                      id='vantaAnimationEnabled'
                      name='vantaAnimationEnabled'
                      isChecked={currentSettings.theme.vantaAnimationEnabled}
                      onChange={handleThemeChange}
                    />
                  </HStack>
                </FormControl>
                <FormControl>
                  <FormLabel>Background Color</FormLabel>
                  <Input type="color" name="vantaBackgroundColor" value={currentSettings.theme.vantaBackgroundColor} onChange={handleThemeChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Line Color</FormLabel>
                  <Input type="color" name="vantaLineColor" value={currentSettings.theme.vantaLineColor} onChange={handleThemeChange} />
                </FormControl>
              </>
            )}

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
