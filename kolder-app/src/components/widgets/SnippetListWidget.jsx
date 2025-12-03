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
        <>
            <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Heading size="md">Snippets</Heading>
            </Flex>
            <Box flex="1" overflowY="auto" mt={4}>
                <SnippetList {...props} />
            </Box>
        </>
    );
};

export default SnippetListWidget;
