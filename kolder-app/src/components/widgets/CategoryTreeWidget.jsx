import { Box, Flex, Heading } from '@chakra-ui/react';
import CategoryTree from '../CategoryTree';

/**
 * A widget that displays the category tree.
 * It's a wrapper around the CategoryTree component, providing a consistent layout.
 * @param {object} props - The component's props, which are passed down to the CategoryTree component.
 * @returns {JSX.Element} The rendered component.
 */
const CategoryTreeWidget = (props) => {
    return (
        <>
            <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Heading size="md">Categories</Heading>
            </Flex>
            <Box flex="1" overflowY="auto" mt={4}>
                <CategoryTree {...props} />
            </Box>
        </>
    );
};

export default CategoryTreeWidget;
