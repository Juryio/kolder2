import { useState } from 'react';
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

  const handleCopy = () => {
    const formattedDate = format(date, 'dd.MM.yyyy');
    navigator.clipboard.writeText(formattedDate).then(() => {
      toast({
        title: 'Date Copied!',
        description: `${formattedDate} has been copied to your clipboard.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }, (err) => {
      toast({
        title: 'Error',
        description: 'Could not copy date.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      console.error('Could not copy text: ', err);
    });
  };

  const handleDayClick = (day, event) => {
    // Check if the click was a right-click
    if (event.nativeEvent.button === 2) {
      event.preventDefault();
      const formattedDate = format(day, 'dd.MM.yyyy');

      // Use the new clipboard fallback
      if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(formattedDate);
        return;
      }
      navigator.clipboard.writeText(formattedDate).then(() => {
        toast({
          title: 'Date Copied!',
          description: `${formattedDate} has been copied to your clipboard.`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }, (err) => {
        toast({
          title: 'Error',
          description: 'Could not copy date.',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
        console.error('Could not copy text: ', err);
      });
    } else {
      // It's a left-click, so update the date
      setDate(day);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast({
          title: 'Date Copied!',
          description: `${text} has been copied to your clipboard.`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Could not copy date.',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not copy date.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }

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
                onClickDay={handleDayClick}
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
