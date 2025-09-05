import { Box, Flex, Heading } from '@chakra-ui/react';
import SnippetList from '../SnippetList';

const SnippetListWidget = (props) => {
    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} h="100%" display="flex" flexDirection="column">
            <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Heading size="md">Snippets</Heading>
            </Flex>
            <Box flex="1" overflowY="auto">
                <SnippetList {...props} />
            </Box>
        </Box>
    );
};

export default SnippetListWidget;
