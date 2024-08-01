import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, Text, Heading, VStack, HStack, Button } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const DraggableTask = ({ task, isRemovable, onRemove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Box
      ref={drag}
      p={4}
      bg="white"
      boxShadow="md"
      borderRadius="md"
      opacity={isDragging ? 0.5 : 1}
      width="100%"
    >
      <VStack align="start" spacing={1}>
        <Text fontSize="sm" color="gray.500">{task.caseNumber}</Text>
        <Heading size="md">{task.title}</Heading>
        <Text>{task.owner}</Text>
        <Text color="blue.500">{task.stage}</Text>
      </VStack>
      {isRemovable && (
        <HStack justifyContent="flex-end">
          <Button size="sm" leftIcon={<DeleteIcon />} colorScheme="red" onClick={onRemove}>
            Slett
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default DraggableTask;
