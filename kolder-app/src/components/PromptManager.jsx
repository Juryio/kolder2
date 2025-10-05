import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    useToast,
    Box,
    HStack,
    IconButton,
    Text
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

const api = axios.create({
    baseURL: '/api',
});

const PromptManager = ({ isOpen, onClose, settings }) => {
    const [prompts, setPrompts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [newName, setNewName] = useState('');
    const [newPromptText, setNewPromptText] = useState('');
    const toast = useToast();

    const fetchPrompts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/prompts');
            setPrompts(response.data);
        } catch (error) {
            toast({
                title: 'Error fetching prompts',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPrompts();
        }
    }, [isOpen]);

    const handleSave = async () => {
        const data = { name: newName, prompt: newPromptText };
        try {
            if (editingPrompt) {
                await api.put(`/prompts/${editingPrompt._id}`, data);
            } else {
                await api.post('/prompts', data);
            }
            fetchPrompts();
            setEditingPrompt(null);
            setNewName('');
            setNewPromptText('');
        } catch (error) {
            toast({
                title: 'Error saving prompt',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/prompts/${id}`);
            fetchPrompts();
        } catch (error) {
            toast({
                title: 'Error deleting prompt',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const startEditing = (prompt) => {
        setEditingPrompt(prompt);
        setNewName(prompt.name);
        setNewPromptText(prompt.prompt);
    };

    const cancelEditing = () => {
        setEditingPrompt(null);
        setNewName('');
        setNewPromptText('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent bg={settings?.theme.contentBackgroundColor} color={settings?.theme.textColor}>
                <ModalHeader>Manage AI Prompts</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Box p={4} borderWidth="1px" borderRadius="md">
                            <Heading size="sm" mb={2}>{editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}</Heading>
                            <FormControl mb={2}>
                                <FormLabel>Name</FormLabel>
                                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Zusammenfassung (DE)" />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Prompt Text</FormLabel>
                                <Textarea value={newPromptText} onChange={(e) => setNewPromptText(e.target.value)} placeholder="e.g., Fasse den folgenden Text auf Deutsch zusammen: " />
                            </FormControl>
                            <HStack mt={4} justify="flex-end">
                                {editingPrompt && <Button onClick={cancelEditing}>Cancel</Button>}
                                <Button colorScheme="purple" onClick={handleSave}>{editingPrompt ? 'Update' : 'Create'}</Button>
                            </HStack>
                        </Box>

                        <Heading size="sm" mt={4}>Existing Prompts</Heading>
                        {isLoading ? <Text>Loading...</Text> : (
                            prompts.map(p => (
                                <HStack key={p._id} justify="space-between" p={2} borderWidth="1px" borderRadius="md">
                                    <Box>
                                        <Text fontWeight="bold">{p.name}</Text>
                                        <Text fontSize="sm" color="gray.400">{p.prompt}</Text>
                                    </Box>
                                    <HStack>
                                        <IconButton icon={<EditIcon />} size="sm" onClick={() => startEditing(p)} />
                                        <IconButton icon={<DeleteIcon />} size="sm" onClick={() => handleDelete(p._id)} />
                                    </HStack>
                                </HStack>
                            ))
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default PromptManager;