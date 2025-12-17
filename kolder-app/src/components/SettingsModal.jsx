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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const [currentSettings, setCurrentSettings] = useState({ title: '', icon: '', language: 'en', theme: { backgroundColor: '', contentBackgroundColor: '', textColor: '', accentColor: '', gradientColor1: '', gradientColor2: '', gradientColor3: '', animationEnabled: true, animationSpeed: 30, animationType: 'rotate', customBackground: '', backgroundType: 'animated' }, languageToolEnabled: false, languageToolApiUrl: '', languageToolLanguage: 'auto' });
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (settings) {
      // Ensure theme object exists to avoid errors
      setCurrentSettings({
        ...settings,
        language: settings.language || 'en',
        theme: settings.theme || { backgroundColor: '', contentBackgroundColor: '', textColor: '', accentColor: '', gradientColor1: '', gradientColor2: '', gradientColor3: '', animationEnabled: true, animationSpeed: 30, animationType: 'rotate', customBackground: '', backgroundType: 'animated' },
        languageToolEnabled: settings.languageToolEnabled || false,
        languageToolApiUrl: settings.languageToolApiUrl || '',
        languageToolLanguage: settings.languageToolLanguage || 'auto',
      });
      if (settings.language && i18n.language !== settings.language) {
        i18n.changeLanguage(settings.language);
      }
    }
  }, [settings, isOpen, i18n]);

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

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    setCurrentSettings(prev => ({ ...prev, language: newLang }));
  };

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
      <ModalContent color={currentSettings.theme?.textColor}>
        <ModalHeader>{t('settings_title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>{t('general_tab')}</Tab>
              <Tab>{t('data_tab')}</Tab>
              <Tab>{t('languagetool_tab')}</Tab>
              <Tab>{t('appearance_tab')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>{t('app_title_label')}</FormLabel>
                    <Input
                      name="title"
                      value={currentSettings.title}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t('icon_url_label')}</FormLabel>
                    <Input
                      name="icon"
                      value={currentSettings.icon}
                      onChange={handleChange}
                      placeholder={t('icon_url_placeholder')}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t('language_label')}</FormLabel>
                    <Select value={currentSettings.language} onChange={handleLanguageChange}>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </Select>
                  </FormControl>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={4}>
                  <Heading size="sm" mt={4} alignSelf="flex-start">{t('data_management_heading')}</Heading>
                  <Button onClick={handleExport} data-testid="export-button" variant="glass">{t('export_data_button')}</Button>
                  <Button as="label" htmlFor="import-file" variant="glass">
                    {t('import_data_button')}
                    <Input
                      id="import-file"
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      display="none"
                    />
                  </Button>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={4}>
                  <Heading size="sm" mt={4} alignSelf="flex-start">{t('languagetool_settings_heading')}</Heading>
                  <FormControl>
                      <HStack>
                          <FormLabel htmlFor='languageToolEnabled' mb='0'>
                              {t('enable_languagetool_label')}
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
                    <FormLabel>{t('languagetool_api_url_label')}</FormLabel>
                    <Input
                      name="languageToolApiUrl"
                      value={currentSettings.languageToolApiUrl}
                      onChange={handleChange}
                      placeholder="e.g., http://localhost:8010/v2/check"
                      isDisabled={!currentSettings.languageToolEnabled}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t('languagetool_language_label')}</FormLabel>
                    <Input
                      name="languageToolLanguage"
                      value={currentSettings.languageToolLanguage}
                      onChange={handleChange}
                      placeholder="e.g., en-US, de-DE, auto"
                      isDisabled={!currentSettings.languageToolEnabled}
                    />
                  </FormControl>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={4}>
                  <Heading size="sm" mt={4} alignSelf="flex-start">{t('theme_colors_heading')}</Heading>
                  <FormControl>
                    <FormLabel>{t('main_background_label')}</FormLabel>
                    <Input type="color" name="backgroundColor" value={currentSettings.theme.backgroundColor} onChange={handleThemeChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t('content_background_label')}</FormLabel>
                    <Input type="color" name="contentBackgroundColor" value={currentSettings.theme.contentBackgroundColor} onChange={handleThemeChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t('text_color_label')}</FormLabel>
                    <Input type="color" name="textColor" value={currentSettings.theme.textColor} onChange={handleThemeChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t('accent_color_label')}</FormLabel>
                    <Input type="color" name="accentColor" value={currentSettings.theme.accentColor} onChange={handleThemeChange} />
                  </FormControl>

                  <Heading size="sm" mt={4} alignSelf="flex-start">{t('background_heading')}</Heading>
                  <FormControl>
                    <FormLabel>{t('background_type_label')}</FormLabel>
                    <Select name="backgroundType" value={currentSettings.theme.backgroundType || 'animated'} onChange={handleThemeChange}>
                      <option value="animated">{t('animated_background_option')}</option>
                      <option value="custom">{t('custom_background_option')}</option>
                      <option value="darkVeil">{t('dark_veil_background_option')}</option>
                    </Select>
                  </FormControl>

                  {currentSettings.theme.backgroundType === 'animated' && (
                    <>
                      <Heading size="sm" mt={4} alignSelf="flex-start">{t('animated_background_options_heading')}</Heading>
                      <FormControl>
                        <HStack>
                          <FormLabel htmlFor='animationEnabled' mb='0'>
                            {t('enable_animation_label')}
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
                        <FormLabel>{t('gradient_color_1_label')}</FormLabel>
                        <Input type="color" name="gradientColor1" value={currentSettings.theme.gradientColor1} onChange={handleThemeChange} isDisabled={!currentSettings.theme.animationEnabled} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t('gradient_color_2_label')}</FormLabel>
                        <Input type="color" name="gradientColor2" value={currentSettings.theme.gradientColor2} onChange={handleThemeChange} isDisabled={!currentSettings.theme.animationEnabled} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t('gradient_color_3_label')}</FormLabel>
                        <Input type="color" name="gradientColor3" value={currentSettings.theme.gradientColor3} onChange={handleThemeChange} isDisabled={!currentSettings.theme.animationEnabled} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t('animation_type_label')}</FormLabel>
                        <Select name="animationType" value={currentSettings.theme.animationType} onChange={handleThemeChange} isDisabled={!currentSettings.theme.animationEnabled}>
                          <option value="rotate">{t('animation_rotate_option')}</option>
                          <option value="pan">{t('animation_pan_option')}</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t('animation_speed_label')} ({currentSettings.theme.animationSpeed}s)</FormLabel>
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
                      <Heading size="sm" mt={4} alignSelf="flex-start">{t('custom_background_options_heading')}</Heading>
                      <FormControl>
                        <FormLabel>{t('upload_image_label')}</FormLabel>
                        <Input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} display="none" />
                        <Button onClick={() => fileInputRef.current.click()} variant="glass">{t('choose_file_button')}</Button>
                        {currentSettings.theme.customBackground && (
                          <Button ml={2} onClick={removeCustomBackground} variant="glass">{t('remove_image_button')}</Button>
                        )}
                      </FormControl>
                    </>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleSave}>
            {t('save_button')}
          </Button>
          <Button variant="glass" onClick={onClose}>{t('cancel_button')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
