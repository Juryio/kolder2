import { Box } from '@chakra-ui/react';
import SnippetList from '../SnippetList';

const SnippetListWidget = (props) => {
    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} h="100%" overflowY="auto">
            <SnippetList {...props} />
        </Box>
    );
};

export default SnippetListWidget;
