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

  const fallbackCopyTextToClipboard = useCallback((text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Make the textarea non-editable and move it off-screen
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';

    document.body.appendChild(textArea);

    // Save the current selection
    const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;

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

    // Restore the original selection
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
  }, [toast]);

  const handleCopy = () => {
    const formattedDate = format(date, 'dd.MM.yyyy');
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(formattedDate);
    } else {
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
