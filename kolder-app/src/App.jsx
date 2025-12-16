import { useState, useEffect, useMemo, lazy, Suspense, useRef } from 'react';
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
import { SettingsIcon, ViewIcon, AddIcon, CalendarIcon } from '@chakra-ui/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CategoryTreeWidget from './components/widgets/CategoryTreeWidget';
import SnippetListWidget from './components/widgets/SnippetListWidget';
import SnippetViewer from './components/SnippetViewer';
import AddCategoryModal from './components/AddCategoryModal';

const SettingsModal = lazy(() => import('./components/SettingsModal'));
const AnalyticsPage = lazy(() => import('./components/AnalyticsPage'));
const StartingSnippetManager = lazy(() => import('./components/StartingSnippetManager'));
const CalendarModal = lazy(() => import('./components/CalendarModal'));
const DarkVeil = lazy(() => import('./components/DarkVeil'));


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
            <Flex
              flex="3"
              mr="4"
              p="4"
              bg="rgba(255, 255, 255, 0.08)"
              backdropFilter="blur(20px)"
              borderRadius="lg"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
              direction="column"
            >
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
            </Flex>
            <Flex
              flex="9"
              p="4"
              bg="rgba(255, 255, 255, 0.05)"
              backdropFilter="blur(10px)"
              borderRadius="lg"
              border="1px solid rgba(255, 255, 255, 0.1)"
              direction="column"
            >
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
            </Flex>
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
  const { isOpen: isCalendarOpen, onOpen: onCalendarOpen, onClose: onCalendarClose } = useDisclosure();
  const [openCategories, setOpenCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'analytics'
  const debounceTimeout = useRef(null);

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

  useEffect(() => {
    if (settings?.theme) {
      const {
        backgroundColor,
        gradientColor1,
        gradientColor2,
        gradientColor3,
        animationEnabled,
        animationSpeed,
        animationType,
        customBackground,
        backgroundType
      } = settings.theme;

      const root = document.documentElement;
      root.style.setProperty('--gradient-color-1', gradientColor1);
      root.style.setProperty('--gradient-color-2', gradientColor2);
      root.style.setProperty('--gradient-color-3', gradientColor3);
      root.style.setProperty('--animation-speed', `${animationSpeed}s`);
      root.style.setProperty('--animation-name', `background-${animationType}`);

      document.body.style.backgroundColor = backgroundColor;

      if (backgroundType === 'darkVeil') {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = 'transparent';
        document.body.classList.remove('animation-enabled');
      } else if (backgroundType === 'custom' && customBackground) {
        document.body.style.backgroundImage = `url(${customBackground})`;
        document.body.classList.remove('animation-enabled');
      } else {
        document.body.style.backgroundImage = 'none';
        if (animationEnabled) {
          document.body.classList.add('animation-enabled');
        } else {
          document.body.classList.remove('animation-enabled');
        }
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
      const { data: newCategory } = await api.post('/categories', { name, parentId: addCategoryParentId });
      // We still refetch the category tree because client-side tree manipulation is complex.
      // This is a compromise to avoid bugs while still being more efficient than fetchAllData.
      const { data: newCategories } = await api.get('/categories');
      setCategories(newCategories);
      onAddCategoryClose();
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
      // We still refetch the category tree because client-side tree manipulation is complex.
      const { data: newCategories } = await api.get('/categories');
      setCategories(newCategories);
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
      // Because deleting a category can have cascading effects, we refetch
      const { data: newCategories } = await api.get('/categories');
      setCategories(newCategories);
      // Also refetch snippets as they might have been deleted
      const { data: newSnippets } = await api.get('/snippets');
      setSnippets(newSnippets);
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
        const { data: newCategories } = await api.get('/categories');
        setCategories(newCategories);
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
        const { data: updatedSnippet } = await api.put(`/snippets/${snippetId}`, { categoryId: categoryId });
        setSnippets(prev => prev.map(s => s._id === snippetId ? updatedSnippet : s));
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
        alert('Please select a category first to add a snippet.');
        return;
    }
    try {
      const { data: newSnippet } = await api.post('/snippets', { ...snippet, categoryId: selectedCategory });
      setSnippets(prev => [...prev, newSnippet]);
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
      const { data: returnedSnippet } = await api.put(`/snippets/${updatedSnippet._id}`, updatedSnippet);
      setSnippets(prev => prev.map(s => s._id === returnedSnippet._id ? returnedSnippet : s));
      setSelectedSnippet(returnedSnippet);
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
      setSnippets(prev => prev.filter(s => s._id !== id));
    } catch (error)
      {
      console.error('Error deleting snippet:', error);
    }
  };

  /**
   * Handles changes to the search term, debouncing the API call.
   * @param {string} term - The new search term.
   */
  const handleSearchChange = (term) => {
    setSearchTerm(term);

    // Clear the previous timeout
    if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
    }

    if (term) {
        setSelectedCategory(null); // Clear category selection when searching
        // Set a new timeout to call the API after 300ms
        debounceTimeout.current = setTimeout(async () => {
            try {
                const { data } = await api.get(`/search?q=${term}`);
                setSearchResults(data);
            } catch (error) {
                console.error('Error fetching search results:', error);
                setSearchResults([]);
            }
        }, 300);
    } else {
        setSearchResults([]); // Clear results if search term is empty
    }
  }

  const filteredSnippets = useMemo(() => {
    // If there's a search term, the source of truth is the searchResults state.
    if (searchTerm) {
      return searchResults;
    }
    // Otherwise, it's the snippets filtered by the selected category.
    return snippets.filter(snippet => snippet.categoryId === selectedCategory);
  }, [snippets, searchTerm, selectedCategory, searchResults]);

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
      <Flex direction="column" minH="100vh" w="100%">
        <Flex
          as="header"
          p="4"
          alignItems="center"
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          borderBottom="1px solid rgba(255, 255, 255, 0.2)"
          position="sticky"
          top="0"
          zIndex="docked"
        >
          {settings?.icon && <Image src={settings.icon} alt="App Icon" boxSize="32px" mr={3} />}
        <Heading size="md">{settings?.title || 'Kolder'}</Heading>
        <Spacer />
        <IconButton
            onClick={() => setCurrentView('analytics')}
            icon={<ViewIcon />}
            aria-label="Analytics"
            mr={2}
        />
        <IconButton
            onClick={onStartingSnippetOpen}
            icon={<AddIcon />}
            aria-label="Manage Starting Snippets"
            mr={2}
        />
        <IconButton
            onClick={onCalendarOpen}
            icon={<CalendarIcon />}
            aria-label="Open Calendar"
            mr={2}
        />
        <IconButton
            onClick={onSettingsOpen}
            icon={<SettingsIcon />}
            aria-label="Settings"
            mr={2}
        />
      </Flex>
      <Suspense fallback={<Flex justify="center" align="center" flex="1"><Spinner size="xl" /></Flex>}>
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
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={onCalendarClose}
          settings={settings}
        />
      </Suspense>
    </Flex>
    </DndProvider>
  );
}

export default App;
