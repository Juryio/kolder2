import { useState, useCallback } from 'react';
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
} from '@chakra-ui/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { format } from 'date-fns';

const CalendarModal = ({ isOpen, onClose, settings }) => {
  const [date, setDate] = useState(new Date());
  const toast = useToast();

  const handleCopy = async () => {
    const formattedDate = format(date, 'dd.MM.yyyy');

    if (!navigator.clipboard || !window.isSecureContext) {
      toast({
        title: 'Error',
        description: 'Cannot copy date. This feature requires a secure context (HTTPS or localhost).',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(formattedDate);
      toast({
        title: 'Date Copied!',
        description: `${formattedDate} has been copied to your clipboard.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not copy date. Please ensure you have granted clipboard permissions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Could not copy text: ', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={settings?.theme.contentBackgroundColor} color={settings?.theme.textColor}>
        <ModalHeader>Calendar</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <Box border="1px" borderColor="gray.600" borderRadius="md">
              <Calendar
                onChange={setDate}
                value={date}
                locale="de-DE"
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            bgGradient={`linear(to-r, ${settings?.theme.accentColor}, purple.500)`}
            _hover={{
                bgGradient: `linear(to-r, ${settings?.theme.accentColor}, purple.600)`
            }}
            onClick={handleCopy}
          >
            Copy Selected Date (dd.MM.yyyy)
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
