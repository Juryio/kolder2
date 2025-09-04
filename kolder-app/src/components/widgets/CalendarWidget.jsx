import { useState } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css'; // Default styling

const CalendarWidget = () => {
    const [date, setDate] = useState(new Date());
    const toast = useToast();

    const handleDateCopy = (value) => {
        const formattedDate = format(value, 'dd.MM.yyyy');
        navigator.clipboard.writeText(formattedDate).then(() => {
            toast({
                title: 'Date Copied!',
                description: `${formattedDate} has been copied to your clipboard.`,
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        });
    };

    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} h="100%">
            <Calendar
                onChange={setDate}
                value={date}
                onClickDay={handleDateCopy}
            />
        </Box>
    );
};

export default CalendarWidget;
