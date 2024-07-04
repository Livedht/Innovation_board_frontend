import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, VStack, Text, Button, useToast, HStack, Heading, Collapse } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

const TaskItem = ({ task, index, moveTask, handleEdit, handleDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const ref = React.useRef(null);
  const dragDropRef = drag(drop(ref));
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <Box
      ref={dragDropRef}
      p={4}
      bg="white"
      boxShadow="md"
      borderRadius="md"
      opacity={isDragging ? 0.5 : 1}
    >
      <HStack justifyContent="space-between">
        <VStack align="start" spacing={1}>
          <Text fontSize="sm" color="gray.500">{task.caseNumber}</Text>
          <Heading size="md">{task.title}</Heading>
          <Text>{task.owner}</Text>
          <Text color="blue.500">{task.stage}</Text>
        </VStack>
        <Button onClick={toggleOpen}>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
      </HStack>
      <Collapse in={isOpen}>
        <VStack align="start" mt={4} spacing={2}>
          <Text><strong>Beskrivelse:</strong> {task.description}</Text>
          <Text><strong>Relevans for BI:</strong> {task.relevanceForBI}</Text>
          <Text><strong>Behov:</strong> {task.needForCourse}</Text>
          <Text><strong>Målgruppe:</strong> {task.targetGroup}</Text>
          <Text><strong>Vekstpotensial:</strong> {task.growthPotential}</Text>
          <Text><strong>Faglige ressurser:</strong> {task.facultyResources}</Text>
        </VStack>
      </Collapse>
      <HStack mt={4} justifyContent="flex-end">
        <Button size="sm" leftIcon={<EditIcon />} onClick={() => handleEdit(task)}>
          Rediger
        </Button>
        <Button size="sm" leftIcon={<DeleteIcon />} colorScheme="red" onClick={() => handleDelete(task.id)}>
          Slett
        </Button>
      </HStack>
    </Box>
  );
};

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get('http://localhost:5000/tasks')
      .then(response => {
        console.log('Fetched tasks:', response.data);
        setTasks(response.data);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Feil ved henting av oppgaver",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const moveTask = useCallback((dragIndex, hoverIndex) => {
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const [reorderedItem] = newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, reorderedItem);
      return newTasks;
    });
  }, []);

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleDelete = (taskId) => {
    axios.delete(`http://localhost:5000/tasks/${taskId}`)
      .then(() => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        toast({
          title: "Oppgave slettet",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error deleting task:', error);
        toast({
          title: "Feil ved sletting av oppgave",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleUpdate = (updatedTask) => {
    axios.put(`http://localhost:5000/tasks/${updatedTask.id}`, updatedTask)
      .then(response => {
        setTasks(prevTasks => prevTasks.map(task => 
          task.id === updatedTask.id ? response.data : task
        ));
        setEditingTask(null);
        toast({
          title: "Oppgave oppdatert",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error updating task:', error);
        toast({
          title: "Feil ved oppdatering av oppgave",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleDragEnd = useCallback(() => {
    const taskIds = tasks.map(task => task.id);
    axios.post('http://localhost:5000/tasks/reorder', taskIds)
      .then(response => {
        setTasks(response.data);
        toast({
          title: "Rekkefølge oppdatert",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error updating task order:', error);
        toast({
          title: "Feil ved oppdatering av rekkefølge",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [tasks, toast]);

  return (
    <DndProvider backend={HTML5Backend}>
      <VStack spacing={4} align="stretch" width="100%">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            moveTask={moveTask}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ))}
      </VStack>
      {editingTask && (
        <AddTask
          task={editingTask}
          onTaskAdded={handleUpdate}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </DndProvider>
  );
};

export default TasksList;