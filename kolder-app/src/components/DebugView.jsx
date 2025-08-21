import {
  Box,
  Button,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const DebugView = ({ onBack, ...props }) => {
    const dataToDisplay = { ...props };

  return (
    <Box p={8}>
      <Flex align="center" mb="8">
        <Button onClick={onBack} leftIcon={<ArrowBackIcon />} mr="4">
          Back to Main
        </Button>
        <Heading size="lg">Debug View</Heading>
      </Flex>
      <Box
        as="pre"
        p={4}
        bg="gray.900"
        color="gray.100"
        borderRadius="md"
        overflowX="auto"
    >
        {JSON.stringify(dataToDisplay, null, 2)}
      </Box>
    </Box>
  );
};

export default DebugView;
