import { useState, useRef } from 'react';
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
  useToast,
  Box,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const CalendarModal = ({ isOpen, onClose, settings }) => {
  const [date, setDate] = useState(new Date());
  const toast = useToast();
  const inputRef = useRef(null);

  const formattedDate = format(date, 'dd.MM.yyyy');

  const handleInputClick = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleLargeCalendarClick = () => {
    toast({
      title: 'Feature Not Implemented',
      description: 'The large calendar view is not yet available.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={settings?.theme.contentBackgroundColor} color={settings?.theme.textColor}>
        <ModalHeader>Calendar</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box border="1px" borderColor="gray.600" borderRadius="md">
              <Calendar
                onChange={setDate}
                value={date}
                locale="de-DE"
              />
            </Box>
            <InputGroup>
              <Input
                ref={inputRef}
                isReadOnly
                value={formattedDate}
                onClick={handleInputClick}
                textAlign="center"
                cursor="pointer"
              />
            </InputGroup>
          </VStack>
        </ModalBody>
        <ModalFooter>
          {/* Placeholder for future feature */}
          <Button
            variant="outline"
            onClick={handleLargeCalendarClick}
          >
            Large Calendar
          </Button>
          <Button ml={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CalendarModal;
