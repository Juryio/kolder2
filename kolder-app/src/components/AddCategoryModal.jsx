import { useState } from 'react';
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
} from '@chakra-ui/react';

/**
 * A modal dialog for adding a new category.
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to call when the modal is closed.
 * @param {function} props.onAdd - Function to call when the user saves the new category. It receives the category name as an argument.
 * @param {object} props.settings - The application settings, used for theming.
 * @returns {JSX.Element} The rendered component.
 */
const AddCategoryModal = ({ isOpen, onClose, onAdd, settings }) => {
  const [name, setName] = useState('');

  /**
   * Handles the click on the "Save" button.
   * Calls the onAdd prop and closes the modal.
   */
  const handleAdd = () => {
    if (name.trim() === '') return;
    onAdd(name);
    onClose();
    setName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Category</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Category Name</FormLabel>
            <Input
              id="new-category-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            id="new-category-save-button"
            mr={3}
            onClick={handleAdd}
          >
            Save
          </Button>
          <Button variant="glass" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCategoryModal;
