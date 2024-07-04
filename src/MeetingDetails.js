import React from 'react';
import { Box, VStack, Heading, Text, Button } from "@chakra-ui/react";

const MeetingDetails = ({ meeting }) => {
  return (
    <Box>
      <Heading size="lg">Møte Detaljer</Heading>
      <Text>Nummer: {meeting.number}</Text>
      <Text>Dato: {meeting.date}</Text>
      <Heading size="md">Oppgaver</Heading>
      <VStack spacing={4} align="stretch">
        {meeting.tasks.map(task => (
          <Box key={task.id} p={4} bg="gray.100" borderRadius="md">
            <Heading size="sm">{task.title}</Heading>
            <Text>{task.description}</Text>
          </Box>
        ))}
      </VStack>
      <Button mt={4} colorScheme="blue">Generer rapport</Button>
    </Box>
  );
};

export default MeetingDetails;

