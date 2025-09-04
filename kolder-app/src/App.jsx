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
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GridLayout from 'react-grid-layout';
import CategoryTreeWidget from './components/widgets/CategoryTreeWidget';
import SnippetListWidget from './components/widgets/SnippetListWidget';
import SnippetViewer from './components/SnippetViewer';
import AddCategoryModal from './components/AddCategoryModal';
import SettingsModal from './components/SettingsModal';
import AnalyticsPage from './components/AnalyticsPage';
import StartingSnippetManager from './components/StartingSnippetManager';

const api = axios.create({
  baseURL: '/api',
});

// Moved MainView outside of the App component to prevent re-renders
const MainView = ({
    settings,
    categories,
    onOpenAddCategoryModal,
    onEditCategory,
    onDeleteCategory,
    onSelectCategory,
    selectedCategory,
    openCategories,
    onToggleCategory,
    selectedSnippet,
    onBackToList,
    snippets,
    searchTerm,
    onSearchChange,
    onAddSnippet,
    onEditSnippet,
    onDeleteSnippet,
    onSelectSnippet,
    onMoveCategory,
    onMoveSnippet,
}) => {
    const layout = [
        { i: 'categories', x: 0, y: 0, w: 3, h: 10 },
        { i: 'snippets', x: 3, y: 0, w: 9, h: 10 },
    ];

    return (
        <GridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200} draggableHandle=".drag-handle">
            <div key="categories">
                <CategoryTreeWidget
                    settings={settings}
                    categories={categories}
                    onAdd={onOpenAddCategoryModal}
                    onEdit={onEditCategory}
                    onDelete={onDeleteCategory}
                    onSelectCategory={onSelectCategory}
                    selectedCategory={selectedCategory}
                    openCategories={openCategories}
                    onToggleCategory={onToggleCategory}
                    onMove={onMoveCategory}
                    onMoveSnippet={onMoveSnippet}
                />
            </div>
            <div key="snippets">
                {selectedSnippet ? (
                    <SnippetViewer snippet={selectedSnippet} onBack={onBackToList} settings={settings} />
                ) : (
                    <SnippetListWidget
                        snippets={snippets}
                        categories={categories}
                        searchTerm={searchTerm}
                        onSearchChange={onSearchChange}
                        onAdd={onAddSnippet}
                        onEdit={onEditSnippet}
                        onDelete={onDeleteSnippet}
                        onSelectSnippet={onSelectSnippet}
                        settings={settings}
                    />
                )}
            </div>
        </GridLayout>
    );
};

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
  const [openCategories, setOpenCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'analytics'

  const handleToggleCategory = (categoryId) => {
    setOpenCategories(prev => ({
        ...prev,
        [categoryId]: !prev[categoryId]
    }));
  };

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

  const handleMoveCategory = async (draggedId, targetId) => {
    try {
        await api.put(`/categories/${draggedId}`, { parentId: targetId });
        await fetchAllData();
    } catch (error) {
        console.error('Error moving category:', error);
    }
  };

  const handleMoveSnippet = async (snippetId, categoryId) => {
    try {
        await api.put(`/snippets/${snippetId}`, { categoryId: categoryId });
        await fetchAllData();
    } catch (error) {
        console.error('Error moving snippet:', error);
    }
  };

  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
    setSearchTerm('');
  }

  const handleAddSnippet = async (snippet) => {
    if (!selectedCategory) {
        // This should be handled by disabling the button, but as a fallback:
        alert('Please select a category first to add a snippet.');
        return;
    }
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

  const renderView = () => {
      switch(currentView) {
          case 'analytics':
              return <AnalyticsPage onBack={() => setCurrentView('main')} snippets={snippets} setSnippets={setSnippets} settings={settings}/>;
          case 'main':
          default:
              return <MainView
                  settings={settings}
                  categories={categories}
                  onOpenAddCategoryModal={handleOpenAddCategoryModal}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onSelectCategory={handleSelectCategory}
                  selectedCategory={selectedCategory}
                  openCategories={openCategories}
                  onToggleCategory={handleToggleCategory}
                  selectedSnippet={selectedSnippet}
                  onBackToList={handleBackToList}
                  snippets={filteredSnippets}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  onAddSnippet={handleAddSnippet}
                  onEditSnippet={handleEditSnippet}
                  onDeleteSnippet={handleDeleteSnippet}
                  onSelectSnippet={handleSelectSnippet}
                  onMoveCategory={handleMoveCategory}
                  onMoveSnippet={handleMoveSnippet}
              />;
      }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
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
      {renderView()}
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
    </DndProvider>
  );
}

export default App;
