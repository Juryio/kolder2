import { Box, Heading } from '@chakra-ui/react';
import CategoryTree from '../CategoryTree';

const CategoryTreeWidget = (props) => {
    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} h="100%" overflowY="auto">
            <CategoryTree {...props} />
        </Box>
    );
};

export default CategoryTreeWidget;
