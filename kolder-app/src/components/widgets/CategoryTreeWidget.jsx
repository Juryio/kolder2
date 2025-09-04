import { Box, Flex, Heading, Icon } from '@chakra-ui/react';
import { FaGripLines } from 'react-icons/fa';
import CategoryTree from '../CategoryTree';

const CategoryTreeWidget = (props) => {
    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} h="100%" display="flex" flexDirection="column">
            <Flex justifyContent="space-between" alignItems="center" mb={2} className="drag-handle">
                <Heading size="md">Categories</Heading>
                <Box cursor="move">
                    <Icon as={FaGripLines} />
                </Box>
            </Flex>
            <Box flex="1" overflowY="auto">
                <CategoryTree {...props} />
            </Box>
        </Box>
    );
};

export default CategoryTreeWidget;
