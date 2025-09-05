import { Box, Flex, Heading } from '@chakra-ui/react';
import CategoryTree from '../CategoryTree';

const CategoryTreeWidget = (props) => {
    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} h="100%" display="flex" flexDirection="column">
            <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Heading size="md">Categories</Heading>
            </Flex>
            <Box flex="1" overflowY="auto">
                <CategoryTree {...props} />
            </Box>
        </Box>
    );
};

export default CategoryTreeWidget;
