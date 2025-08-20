import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Flex,
  useColorMode,
  Button,
  Heading,
  Spacer,
  useDisclosure,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, SettingsIcon, ViewIcon } from '@chakra-ui/icons';
import CategoryTree from './components/CategoryTree';
import SnippetList from './components/SnippetList';
import SnippetViewer from './components/SnippetViewer';
import AddCategoryModal from './components/AddCategoryModal';
import SettingsModal from './components/SettingsModal';
import AnalyticsPage from './components/AnalyticsPage';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [categories, setCategories] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const { isOpen: isAddCategoryOpen, onOpen: onAddCategoryOpen, onClose: onAddCategoryClose } = useDisclosure();
  const [addCategoryParentId, setAddCategoryParentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
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

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
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
    setLoading(true);
    try {
      await api.post('/categories', { name, parentId: addCategoryParentId, children: [] });
      const catResponse = await api.get('/categories');
      setCategories(catResponse.data);
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (id, newName) => {
    try {
      await api.put(`/categories/${id}`, { name: newName });
      const editRec = (nodes) => {
        return nodes.map((node) => {
          if (node.id === id) {
            return { ...node, name: newName };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: editRec(node.children) };
          }
          return node;
        });
      };
      setCategories(editRec(categories));
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/categories/${id}`);
      const [catResponse, snipResponse] = await Promise.all([
        api.get('/categories'),
        api.get('/snippets'),
      ]);
      setCategories(catResponse.data);
      setSnippets(snipResponse.data);
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
  }

  const handleAddSnippet = async (snippet) => {
    try {
      const response = await api.post('/snippets', { ...snippet, categoryId: selectedCategory });
      setSnippets([...snippets, response.data]);
    } catch (error) {
      console.error('Error adding snippet:', error);
    }
  };

  const handleEditSnippet = async (updatedSnippet) => {
    try {
      await api.put(`/snippets/${updatedSnippet.id}`, updatedSnippet);
      setSnippets(
        snippets.map((snippet) =>
          snippet.id === updatedSnippet.id ? updatedSnippet : snippet
        )
      );
    } catch (error) {
      console.error('Error editing snippet:', error);
    }
  };

  const handleDeleteSnippet = async (id) => {
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(snippets.filter((snippet) => snippet.id !== id));
    } catch (error) {
      console.error('Error deleting snippet:', error);
    }
  };

  const filteredSnippets = snippets
    .filter(snippet => snippet.categoryId === selectedCategory)
    .filter(snippet =>
      snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" minH="100vh" bg={settings?.backgroundColor}>
      <Flex as="header" p="4" borderBottomWidth="1px" alignItems="center">
        <Heading size="md">{settings?.title || 'Kolder'}</Heading>
        <Spacer />
        <IconButton
            onClick={() => setCurrentView('analytics')}
            icon={<ViewIcon />}
            aria-label="Analytics"
            mr={2}
        />
        <IconButton
            onClick={onSettingsOpen}
            icon={<SettingsIcon />}
            aria-label="Settings"
            mr={2}
        />
        <Button onClick={toggleColorMode}>
          {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Flex>
      {currentView === 'analytics' ? (
        <AnalyticsPage onBack={() => setCurrentView('main')} snippets={snippets} setSnippets={setSnippets}/>
      ) : (
        <Flex flex="1">
            <Box as="aside" w="250px" p="4" borderRightWidth="1px" bg={colorMode === 'light' ? 'whiteAlpha.800' : 'gray.800'}>
            <CategoryTree
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
                <SnippetViewer snippet={selectedSnippet} onBack={handleBackToList} />
            ) : (
                <SnippetList
                snippets={filteredSnippets}
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAdd={handleAddSnippet}
                onEdit={handleEditSnippet}
                onDelete={handleDeleteSnippet}
                onSelectSnippet={handleSelectSnippet}
                />
            )}
            </Box>
        </Flex>
      )}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={onAddCategoryClose}
        onAdd={handleAddCategory}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        onSave={handleSaveSettings}
        settings={settings}
      />
    </Flex>
  );
}

export default App;
