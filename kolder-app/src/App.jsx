import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Flex,
  Button,
  Heading,
  Spacer,
  useDisclosure,
  Spinner,
  IconButton,
  Image,
} from '@chakra-ui/react';
import { SettingsIcon, ViewIcon, AddIcon } from '@chakra-ui/icons';
import CategoryTree from './components/CategoryTree';
import SnippetList from './components/SnippetList';
import SnippetViewer from './components/SnippetViewer';
import AddCategoryModal from './components/AddCategoryModal';
import SettingsModal from './components/SettingsModal';
import AnalyticsPage from './components/AnalyticsPage';
import StartingSnippetManager from './components/StartingSnippetManager';

const api = axios.create({
  baseURL: '/api',
});

function App() {
  const [categories, setCategories] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const { isOpen: isAddCategoryOpen, onOpen: onAddCategoryOpen, onClose: onAddCategoryClose } = useDisclosure();
  const [addCategoryParentId, setAddCategoryParentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isStartingSnippetOpen, onOpen: onStartingSnippetOpen, onClose: onStartingSnippetClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'analytics'

  const handleOpenAddCategoryModal = (parentId = null) => {
    setAddCategoryParentId(parentId);
    onAddCategoryOpen();
  };

  const handleSelectSnippet = (snippet) => {
    setSelectedSnippet(snippet);
  };

  const handleBackToList = () => {
    setSelectedSnippet(null);
  };

  const fetchAllData = async () => {
      setLoading(true);
      try {
        const [catResponse, snipResponse, settingsResponse] = await Promise.all([
          api.get('/categories'),
          api.get('/snippets'),
          api.get('/settings'),
        ]);
        setCategories(catResponse.data);
        setSnippets(snipResponse.data);
        setSettings(settingsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (settings) {
      document.title = settings.title;
      const favicon = document.querySelector("link[rel*='icon']");
      if (favicon) {
        favicon.href = settings.icon;
      }
    }
  }, [settings]);

  const handleSaveSettings = async (newSettings) => {
    try {
      const response = await api.put('/settings', newSettings);
      setSettings(response.data);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleAddCategory = async (name) => {
    try {
      await api.post('/categories', { name, parentId: addCategoryParentId });
      await fetchAllData();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = async (id, newName) => {
    try {
      await api.put(`/categories/${id}`, { name: newName });
      await fetchAllData();
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
    setSearchTerm('');
  }

  const handleAddSnippet = async (snippet) => {
    try {
      await api.post('/snippets', { ...snippet, categoryId: selectedCategory });
      await fetchAllData();
    } catch (error) {
      console.error('Error adding snippet:', error);
    }
  };

  const handleEditSnippet = async (updatedSnippet) => {
    try {
      await api.put(`/snippets/${updatedSnippet._id}`, updatedSnippet);
      await fetchAllData();
    } catch (error) {
      console.error('Error editing snippet:', error);
    }
  };

  const handleDeleteSnippet = async (id) => {
    try {
      await api.delete(`/snippets/${id}`);
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting snippet:', error);
    }
  };

  const handleSearchChange = (term) => {
      setSearchTerm(term);
      if(term) {
          setSelectedCategory(null);
      }
  }

  const filteredSnippets = searchTerm
    ? snippets.filter(snippet =>
        snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (snippet.content && snippet.content.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : snippets.filter(snippet => snippet.categoryId === selectedCategory);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" minH="100vh" w="100%" bg={settings?.theme.backgroundColor} color={settings?.theme.textColor}>
      <Flex as="header" p="4" borderBottomWidth="1px" alignItems="center" borderColor={settings?.theme.contentBackgroundColor}>
        {settings?.icon && <Image src={settings.icon} alt="App Icon" boxSize="32px" mr={3} />}
        <Heading size="md">{settings?.title || 'Kolder'}</Heading>
        <Spacer />
        <IconButton
            onClick={() => setCurrentView('analytics')}
            icon={<ViewIcon />}
            aria-label="Analytics"
            mr={2}
            bg={settings?.theme.accentColor}
        />
        <IconButton
            onClick={onStartingSnippetOpen}
            icon={<AddIcon />}
            aria-label="Manage Starting Snippets"
            mr={2}
            bg={settings?.theme.accentColor}
        />
        <IconButton
            onClick={onSettingsOpen}
            icon={<SettingsIcon />}
            aria-label="Settings"
            mr={2}
            bg={settings?.theme.accentColor}
        />
      </Flex>
      {currentView === 'analytics' ? (
        <AnalyticsPage onBack={() => setCurrentView('main')} snippets={snippets} setSnippets={setSnippets} settings={settings}/>
      ) : (
        <Flex flex="1">
            <Box as="aside" w="300px" p="4" borderRightWidth="1px" bg={settings?.theme.contentBackgroundColor} borderColor={settings?.theme.contentBackgroundColor} overflowX="auto">
            <CategoryTree
                settings={settings}
                categories={categories}
                onAdd={handleOpenAddCategoryModal}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onSelectCategory={handleSelectCategory}
                selectedCategory={selectedCategory}
            />
            </Box>
            <Box as="main" flex="1" p="4">
            {selectedSnippet ? (
                <SnippetViewer snippet={selectedSnippet} onBack={handleBackToList} settings={settings} />
            ) : (
                <SnippetList
                snippets={filteredSnippets}
                categories={categories}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onAdd={handleAddSnippet}
                onEdit={handleEditSnippet}
                onDelete={handleDeleteSnippet}
                onSelectSnippet={handleSelectSnippet}
                settings={settings}
                />
            )}
            </Box>
        </Flex>
      )}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={onAddCategoryClose}
        onAdd={handleAddCategory}
        settings={settings}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        onSave={handleSaveSettings}
        settings={settings}
      />
      <StartingSnippetManager
        isOpen={isStartingSnippetOpen}
        onClose={onStartingSnippetClose}
        settings={settings}
      />
    </Flex>
  );
}

export default App;
