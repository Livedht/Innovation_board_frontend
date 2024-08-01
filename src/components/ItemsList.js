// src/components/ItemsList.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, VStack, Button, useToast, HStack, Heading, Flex, Text, IconButton, Collapse, Input } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import AddItem from './AddItem';

const ItemCard = ({ item, index, moveItem, handleEdit, handleDelete, handleNumberChange }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'ITEM',
    item: { id: item.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'ITEM',
    hover(draggedItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  const ref = React.useRef(null);
  const dragDropRef = drag(drop(ref));
  const [isOpen, setIsOpen] = useState(false);
  const [itemNumber, setItemNumber] = useState(item.caseNumber);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleItemNumberChange = (e) => {
    setItemNumber(e.target.value);
    handleNumberChange(item.id, e.target.value);
  };

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
          <Flex align="center">
            <Text fontSize="sm" color="gray.500" mr={2}>Item Number:</Text>
            <Input
              size="sm"
              value={itemNumber}
              onChange={handleItemNumberChange}
              width="100px"
            />
          </Flex>
          <Heading size="md">{item.title}</Heading>
          <Text>{item.owner}</Text>
          <Text color="blue.500">{item.stage}</Text>
        </VStack>
        <HStack>
          <Button onClick={toggleOpen}>
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
          <IconButton size="sm" icon={<EditIcon />} onClick={() => handleEdit(item)} />
          <IconButton size="sm" icon={<DeleteIcon />} colorScheme="red" onClick={() => handleDelete(item.id)} />
        </HStack>
      </Flex>
      <Collapse in={isOpen}>
        <VStack align="start" mt={4} spacing={2}>
          <Text><strong>Beskrivelse:</strong> {item.description}</Text>
          <Text><strong>Relevans for BI:</strong> {item.relevanceForBI}</Text>
          <Text><strong>Behov:</strong> {item.needForCourse}</Text>
          <Text><strong>Målgruppe:</strong> {item.targetGroup}</Text>
          <Text><strong>Vekstpotensial:</strong> {item.growthPotential}</Text>
          <Text><strong>Faglige ressurser:</strong> {item.facultyResources}</Text>
        </VStack>
      </Collapse>
    </Box>
  );
};

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const toast = useToast();

  const fetchItems = useCallback(() => {
    axios.get('http://localhost:5000/tasks')
      .then(response => {
        console.log('Fetched items:', response.data);
        setItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching items:', error);
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
    fetchItems();
  }, [fetchItems]);

  const moveItem = useCallback((dragIndex, hoverIndex) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const [reorderedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, reorderedItem);
      return newItems;
    });
  }, []);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsAddingItem(true);
  };

  const handleDelete = (itemId) => {
    axios.delete(`http://localhost:5000/tasks/${itemId}`)
      .then(() => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        toast({
          title: "Oppgave slettet",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error deleting item:', error);
        toast({
          title: "Feil ved sletting av oppgave",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleUpdate = (updatedItem) => {
    axios.put(`http://localhost:5000/tasks/${updatedItem.id}`, updatedItem)
      .then(response => {
        setItems(prevItems => prevItems.map(item =>
          item.id === updatedItem.id ? response.data : item
        ));
        setEditingItem(null);
        setIsAddingItem(false);
        toast({
          title: "Oppgave oppdatert",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error updating item:', error);
        toast({
          title: "Feil ved oppdatering av oppgave",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleAdd = (newItem) => {
    axios.post('http://localhost:5000/tasks', newItem)
      .then(response => {
        setItems(prevItems => [...prevItems, response.data]);
        setIsAddingItem(false);
        toast({
          title: "Oppgave lagt til",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error adding item:', error);
        toast({
          title: "Feil ved tillegg av oppgave",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleNumberChange = (itemId, newNumber) => {
    setItems(prevItems => prevItems.map(item =>
      item.id === itemId ? { ...item, caseNumber: newNumber } : item
    ));
    // You might want to save this change to the backend as well
    axios.put(`http://localhost:5000/tasks/${itemId}`, { caseNumber: newNumber })
      .catch(error => {
        console.error('Error updating item number:', error);
        toast({
          title: "Feil ved oppdatering av oppgavenummer",
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
      fetchItems(); // Refresh the item list after import
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
            <Button colorScheme="blue" onClick={() => setIsAddingItem(true)}>
              Legg til ny idé
            </Button>
            <Button colorScheme="blue" onClick={handleImportNettskjema}>
              Importer data
            </Button>
          </HStack>
        </Flex>
        <VStack spacing={4} align="stretch" width="100%">
          {items.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              index={index}
              moveItem={moveItem}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleNumberChange={handleNumberChange}
            />
          ))}
        </VStack>
        {isAddingItem && (
          <AddItem
            item={editingItem}
            onItemAdded={(item) => {
              if (editingItem) {
                handleUpdate(item);
              } else {
                handleAdd(item);
              }
            }}
            onCancel={() => {
              setIsAddingItem(false);
              setEditingItem(null);
            }}
          />
        )}
      </Box>
    </DndProvider>
  );
};

export default ItemsList;