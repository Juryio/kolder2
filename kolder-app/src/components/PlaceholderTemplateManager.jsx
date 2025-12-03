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
  HStack,
  Text,
  IconButton,
  useToast,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

const PlaceholderTemplateManager = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/placeholder-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast({ title: 'Error', description: 'Could not load templates.', status: 'error', duration: 3000 });
    }
  };

  const handleDelete = async (templateId) => {
    try {
      await axios.delete(`/api/placeholder-templates/${templateId}`);
      toast({ title: 'Template deleted', status: 'success', duration: 2000 });
      fetchTemplates(); // Refresh list
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast({ title: 'Error', description: 'Could not delete template.', status: 'error', duration: 3000 });
    }
  };

  const openEditModal = (template) => {
    setSelectedTemplate(template);
    setName(template.name);
    setDescription(template.description);
    onEditOpen();
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;
    try {
      const updatedData = { ...selectedTemplate, name, description };
      await axios.put(`/api/placeholder-templates/${selectedTemplate._id}`, updatedData);
      toast({ title: 'Template updated', status: 'success', duration: 2000 });
      fetchTemplates(); // Refresh list
      onEditClose();
    } catch (error) {
      console.error('Failed to update template:', error);
      toast({ title: 'Error', description: 'Could not update template.', status: 'error', duration: 3000 });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Placeholder Templates</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <HStack key={template._id} justify="space-between" p={2} borderWidth="1px" borderRadius="md">
                    <VStack align="start">
                      <Text fontWeight="bold">{template.name}</Text>
                      <Text fontSize="sm" color="gray.500">{template.description}</Text>
                    </VStack>
                    <HStack>
                      <IconButton icon={<EditIcon />} onClick={() => openEditModal(template)} aria-label="Edit template" />
                      <IconButton icon={<DeleteIcon />} onClick={() => handleDelete(template._id)} aria-label="Delete template" colorScheme="red" />
                    </HStack>
                  </HStack>
                ))
              ) : (
                <Text>No templates saved yet.</Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
              Update
            </Button>
            <Button onClick={onEditClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PlaceholderTemplateManager;
