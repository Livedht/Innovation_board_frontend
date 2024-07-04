import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Box, VStack, Button, useToast, Heading } from "@chakra-ui/react";

const MeetingList = ({ onSelectMeeting }) => {
  const [meetings, setMeetings] = useState([]);
  const toast = useToast();

  const fetchMeetings = useCallback(() => {
    axios.get('http://localhost:5000/meetings')
      .then(response => {
        setMeetings(response.data);
      })
      .catch(error => {
        toast({
          title: "Feil ved henting av møter",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [toast]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return (
    <Box>
      <Heading size="lg">Møter</Heading>
      <VStack spacing={4} align="stretch">
        {meetings.map(meeting => (
          <Button key={meeting.id} onClick={() => onSelectMeeting(meeting)}>
            {meeting.number} - {meeting.date}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};

export default MeetingList;
