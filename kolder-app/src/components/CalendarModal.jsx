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

  const handleRightClick = (day, event) => {
    event.preventDefault();
    const formattedDate = format(day, 'dd.MM.yyyy');
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

  const renderTileContent = ({ date, view }) => {
    // Add the right-click handler only on month view
    if (view === 'month') {
      return (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          onContextMenu={(e) => handleRightClick(date, e)}
          title="Right-click to copy date"
        />
      );
    }
    return null;
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
                tileContent={renderTileContent}
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
