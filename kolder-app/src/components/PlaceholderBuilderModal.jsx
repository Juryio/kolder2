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
} from '@chakra-ui/react';

const PlaceholderBuilderModal = ({ isOpen, onClose, onInsert }) => {
  // Logic for building placeholders will go here

  const handleInsert = () => {
    // This will eventually build the placeholder string
    const placeholderString = '{{test_from_modal}}';
    onInsert(placeholderString);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Placeholder Builder</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <p>Placeholder configuration UI will be here.</p>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleInsert}>
            Insert
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PlaceholderBuilderModal;
