import React from 'react';
import { useDrop } from 'react-dnd';
import { Box, VStack, Heading, Text, Button, HStack, Collapse } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const DroppableMeeting = ({ meeting, onDropTask, onRemoveTask, onToggleExpand, isExpanded, onGenerateReport, onGenerateMinutes, onDeleteMeeting, onUpdateMinutes }) => {
  const { id, number, date, location, tasks = [] } = meeting;

  const [, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => onDropTask(id, item.id),
  });

  return (
    <Box ref={drop} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" bg="gray.100" p={4}>
      <HStack justifyContent="space-between" mb={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg">{number || 'No number'}</Heading>
          <Text>{date || 'No date'}</Text>
          <Text>{location || 'No location'}</Text>
        </VStack>
        <HStack>
          <Button onClick={() => onToggleExpand(id)} size="sm">
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button onClick={() => onGenerateReport(id)} size="sm">Generate Report</Button>
          <Button onClick={() => onGenerateMinutes(id)} size="sm">Generate Minutes</Button>
          <Button onClick={() => onDeleteMeeting(id)} size="sm" colorScheme="red">Delete Meeting</Button>
        </HStack>
      </HStack>

      <Collapse in={isExpanded} animateOpacity>
        <VStack spacing={4} align="stretch">
          {tasks && tasks.map((task) => (
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
      </Collapse>
    </Box>
  );
};

export default DroppableMeeting;