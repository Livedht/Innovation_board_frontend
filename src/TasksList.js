import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, VStack, Button, useToast, HStack, Heading, Flex, Text, IconButton, Collapse } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import AddTask from './AddTask';

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
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Text fontSize="sm" color="gray.500">{task.caseNumber}</Text>
          <Heading size="md">{task.title}</Heading>
          <Text>{task.owner}</Text>
          <Text color="blue.500">{task.stage}</Text>
        </VStack>
        <HStack>
          <Button onClick={toggleOpen}>
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
          <IconButton size="sm" icon={<EditIcon />} onClick={() => handleEdit(task)} />
          <IconButton size="sm" icon={<DeleteIcon />} colorScheme="red" onClick={() => handleDelete(task.id)} />
        </HStack>
      </Flex>
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
    </Box>
  );
};

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const toast = useToast();

  const fetchTasks = useCallback(() => {
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
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
    setIsAddingTask(true);
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
        setIsAddingTask(false);
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

  const handleAdd = (newTask) => {
    axios.post('http://localhost:5000/tasks', newTask)
      .then(response => {
        setTasks(prevTasks => [...prevTasks, response.data]);
        setIsAddingTask(false);
        toast({
          title: "Oppgave lagt til",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error adding task:', error);
        toast({
          title: "Feil ved tillegg av oppgave",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleImportNettskjema = async () => {
    try {
      const response = await axios.post('http://localhost:5000/import-nettskjema');
      toast({
        title: "Import successful",
        description: `Imported ${response.data.imported_tasks.length} tasks`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchTasks(); // Refresh the task list after import
    } catch (error) {
      toast({
        title: "Import failed",
        description: error.response?.data?.error || "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">Saksdatabase</Heading>
          <HStack>
            <Button colorScheme="blue" onClick={() => setIsAddingTask(true)}>
              Legg til ny idé
            </Button>
            <Button colorScheme="blue" onClick={handleImportNettskjema}>
              Importer data
            </Button>
          </HStack>
        </Flex>
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
        {isAddingTask && (
          <AddTask
            task={editingTask}
            onTaskAdded={(task) => {
              if (editingTask) {
                handleUpdate(task);
              } else {
                handleAdd(task);
              }
            }}
            onCancel={() => {
              setIsAddingTask(false);
              setEditingTask(null);
            }}
          />
        )}
      </Box>
    </DndProvider>
  );
};

export default TasksList;