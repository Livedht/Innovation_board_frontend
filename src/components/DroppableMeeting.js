import React from 'react';
import { useDrop } from 'react-dnd';
import { Box, VStack, Heading, Text, Button, HStack } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const DroppableMeeting = ({ meeting = {}, onDropTask, onRemoveTask }) => {
  const { id, number, date, tasks = [] } = meeting;

  const [, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => {
      if (id && item.id) {
        onDropTask(id, item.id);
      }
    },
  });

  return (
    <Box ref={drop} p={4} bg="gray.100" borderRadius="md" boxShadow="md">
      <Heading size="lg">{number || 'No number'}</Heading>
      <Text>{date || 'No date'}</Text>
      <VStack spacing={4} align="stretch" mt={4}>
        {tasks.map((task) => (
          <HStack
            key={task.id}
            p={4}
            bg="white"
            borderRadius="md"
            boxShadow="sm"
            justifyContent="space-between"
          >
            <VStack align="start">
              <Text fontSize="sm" color="gray.500">
                {task.caseNumber}
              </Text>
              <Heading size="sm">{task.title}</Heading>
              <Text>{task.description}</Text>
            </VStack>
            <Button
              size="sm"
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              onClick={() => onRemoveTask(id, task.id)}
            >
              Remove
            </Button>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default DroppableMeeting;
