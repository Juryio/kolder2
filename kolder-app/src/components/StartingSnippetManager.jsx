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
  HStack,
  Text,
  IconButton,
  useToast,
  Textarea,
  Heading,
  Box
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

/**
 * A modal dialog for managing starting snippets.
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to call when the modal is closed.
 * @param {object} props.settings - The application settings, used for theming.
 * @returns {JSX.Element} The rendered component.
 */
const StartingSnippetManager = ({ isOpen, onClose, settings }) => {
    const [startingSnippets, setStartingSnippets] = useState([]);
    const [newName, setNewName] = useState('');
    const [newContent, setNewContent] = useState('');
    const toast = useToast();

    /**
     * Fetches the list of starting snippets from the server.
     */
    const fetchData = async () => {
        try {
            const response = await api.get('/starting-snippets');
            setStartingSnippets(response.data);
        } catch (error) {
            console.error('Error fetching starting snippets', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    /**
     * Handles adding a new starting snippet.
     */
    const handleAdd = async () => {
        if (!newName.trim() || !newContent.trim()) {
            toast({ title: 'Name and content are required.', status: 'error', duration: 2000, isClosable: true });
            return;
        }
        try {
            await api.post('/starting-snippets', { name: newName, content: newContent });
            setNewName('');
            setNewContent('');
            fetchData(); // Refetch to show the new snippet
            toast({ title: 'Starting snippet added.', status: 'success', duration: 2000, isClosable: true });
        } catch (error) {
            console.error('Error adding starting snippet', error);
            toast({ title: 'Error adding snippet.', status: 'error', duration: 2000, isClosable: true });
        }
    };

    /**
     * Handles deleting a starting snippet.
     * @param {string} id - The ID of the snippet to delete.
     */
    const handleDelete = async (id) => {
        try {
            await api.delete(`/starting-snippets/${id}`);
            fetchData(); // Refetch
            toast({ title: 'Starting snippet deleted.', status: 'success', duration: 2000, isClosable: true });
        } catch (error) {
            console.error('Error deleting starting snippet', error);
            toast({ title: 'Error deleting snippet.', status: 'error', duration: 2000, isClosable: true });
        }
    };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent color={settings?.theme.textColor}>
        <ModalHeader>Manage Starting Snippets</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
            <VStack spacing={6} align="stretch">
                {/* Add Form */}
                <Box>
                    <Heading size="md" mb={3}>Add New</Heading>
                    <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., 'Polite Greeting'"/>
                    </FormControl>
                    <FormControl mt={3}>
                        <FormLabel>Content</FormLabel>
                        <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="e.g., 'Hello, I hope you are well.'"/>
                    </FormControl>
                    <Button
                        mt={4}
                        onClick={handleAdd}
                        variant="glass"
                    >
                        Add Starting Snippet
                    </Button>
                </Box>
                {/* List */}
                <Box>
                     <Heading size="md" mb={3}>Existing</Heading>
                     <VStack spacing={3} align="stretch">
                        {startingSnippets.length > 0 ? startingSnippets.map(ss => (
                            <HStack key={ss._id} justify="space-between" p={3} borderWidth="1px" borderRadius="md">
                                <Box>
                                    <Text fontWeight="bold">{ss.name}</Text>
                                    <Text fontSize="sm" color="gray.400" noOfLines={1}>{ss.content}</Text>
                                </Box>
                                <IconButton aria-label="Delete starting snippet" icon={<DeleteIcon />} size="sm" onClick={() => handleDelete(ss._id)} variant="glass" />
                            </HStack>
                        )) : <Text>No starting snippets created yet.</Text>}
                     </VStack>
                </Box>
            </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="glass" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StartingSnippetManager;
