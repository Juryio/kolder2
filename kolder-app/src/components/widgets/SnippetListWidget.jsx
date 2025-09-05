import { Box, Flex, Heading } from '@chakra-ui/react';
import SnippetList from '../SnippetList';

/**
 * A widget that displays the snippet list.
 * It's a wrapper around the SnippetList component, providing a consistent layout.
 * @param {object} props - The component's props, which are passed down to the SnippetList component.
 * @returns {JSX.Element} The rendered component.
 */
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
