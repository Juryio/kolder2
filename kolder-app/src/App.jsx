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
/**
 * The main view of the application, containing the category tree and snippet list/viewer.
 * @param {object} props - The component's props.
 * @returns {JSX.Element} The rendered component.
 */
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
    return (
        <Flex w="100%" p="4" flex="1">
            <Box flex="3" mr="4">
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
            </Box>
            <Box flex="9">
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
            </Box>
        </Flex>
    );
};

/**
 * The main component of the application.
 * It manages the application's state and renders the different views.
 * @returns {JSX.Element} The rendered component.
 */
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

  /**
   * Toggles the expanded/collapsed state of a category.
   * @param {string} categoryId - The ID of the category to toggle.
   */
  const handleToggleCategory = (categoryId) => {
    setOpenCategories(prev => ({
        ...prev,
        [categoryId]: !prev[categoryId]
    }));
  };

  /**
   * Opens the "Add Category" modal.
   * @param {string | null} parentId - The ID of the parent category, or null for a root category.
   */
  const handleOpenAddCategoryModal = (parentId = null) => {
    setAddCategoryParentId(parentId);
    onAddCategoryOpen();
  };

  /**
   * Sets the currently selected snippet to be displayed in the viewer.
   * @param {object} snippet - The snippet to select.
   */
  const handleSelectSnippet = (snippet) => {
    setSelectedSnippet(snippet);
  };

  /**
   * Returns to the snippet list view from the snippet viewer.
   */
  const handleBackToList = () => {
    setSelectedSnippet(null);
  };

  /**
   * Fetches all necessary data from the server.
   */
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

  /**
   * Saves the application settings.
   * @param {object} newSettings - The new settings object.
   */
  const handleSaveSettings = async (newSettings) => {
    try {
      const response = await api.put('/settings', newSettings);
      setSettings(response.data);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  /**
   * Adds a new category.
   * @param {string} name - The name of the new category.
   */
  const handleAddCategory = async (name) => {
    try {
      await api.post('/categories', { name, parentId: addCategoryParentId });
      await fetchAllData();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  /**
   * Edits a category's name.
   * @param {string} id - The ID of the category to edit.
   * @param {string} newName - The new name for the category.
   */
  const handleEditCategory = async (id, newName) => {
    try {
      await api.put(`/categories/${id}`, { name: newName });
      await fetchAllData();
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  /**
   * Deletes a category.
   * @param {string} id - The ID of the category to delete.
   */
  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  /**
   * Moves a category to a new parent.
   * @param {string} draggedId - The ID of the category being moved.
   * @param {string | null} targetId - The ID of the new parent category, or null for the root.
   */
  const handleMoveCategory = async (draggedId, targetId) => {
    try {
        await api.put(`/categories/${draggedId}`, { parentId: targetId });
        await fetchAllData();
    } catch (error) {
        console.error('Error moving category:', error);
    }
  };

  /**
   * Moves a snippet to a new category.
   * @param {string} snippetId - The ID of the snippet being moved.
   * @param {string} categoryId - The ID of the new category.
   */
  const handleMoveSnippet = async (snippetId, categoryId) => {
    try {
        await api.put(`/snippets/${snippetId}`, { categoryId: categoryId });
        await fetchAllData();
    } catch (error) {
        console.error('Error moving snippet:', error);
    }
  };

  /**
   * Sets the currently selected category.
   * @param {string} id - The ID of the category to select.
   */
  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
    setSearchTerm('');
  }

  /**
   * Adds a new snippet.
   * @param {object} snippet - The snippet object to add.
   */
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

  /**
   * Edits a snippet.
   * @param {object} updatedSnippet - The updated snippet object.
   */
  const handleEditSnippet = async (updatedSnippet) => {
    try {
      await api.put(`/snippets/${updatedSnippet._id}`, updatedSnippet);
      await fetchAllData();
    } catch (error) {
      console.error('Error editing snippet:', error);
    }
  };

  /**
   * Deletes a snippet.
   * @param {string} id - The ID of the snippet to delete.
   */
  const handleDeleteSnippet = async (id) => {
    try {
      await api.delete(`/snippets/${id}`);
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting snippet:', error);
    }
  };

  /**
   * Handles changes to the search term.
   * @param {string} term - The new search term.
   */
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
