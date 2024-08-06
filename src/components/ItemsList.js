import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, VStack, HStack, Heading, Text, Button, IconButton, Collapse, Input, Link, Flex, Spacer, useToast } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FaFilePdf, FaFileExcel, FaFileWord, FaFileAlt } from 'react-icons/fa';
import AddItem from './AddItem';

const ItemCard = ({ item, handleEdit, handleDelete, handleNumberChange, handleFileUpload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemNumber, setItemNumber] = useState(item.caseNumber);
  const [selectedFile, setSelectedFile] = useState(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleItemNumberChange = (e) => {
    setItemNumber(e.target.value);
  };

  const handleItemNumberBlur = () => {
    handleNumberChange(item.id, itemNumber);
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FaFileAlt color="#7d7d7d" size="24px" />;
    const extension = filename.split('.').pop().toLowerCase();
    const iconProps = { size: "24px" };
    switch (extension) {
      case 'pdf': return <FaFilePdf color="#f40f02" {...iconProps} />;
      case 'xlsx':
      case 'xls': return <FaFileExcel color="#1D6F42" {...iconProps} />;
      case 'docx':
      case 'doc': return <FaFileWord color="#2B579A" {...iconProps} />;
      default: return <FaFileAlt color="#7d7d7d" {...iconProps} />;
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSaveFile = () => {
    if (selectedFile) {
      handleFileUpload(item.id, selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" bg="white" p={4}>
      <VStack align="stretch" spacing={3}>
        <Flex align="center">
          <Input
            size="sm"
            value={itemNumber}
            onChange={handleItemNumberChange}
            onBlur={handleItemNumberBlur} // Save on blur
            width="100px"
            mr={2}
          />
          <Heading size="md" flex={1}>{item.title}</Heading>
          <Spacer />
          <HStack>
            <IconButton size="sm" icon={<EditIcon />} onClick={() => handleEdit(item)} />
            <IconButton size="sm" icon={<DeleteIcon />} colorScheme="red" onClick={() => handleDelete(item.id)} />
            <Button size="sm" onClick={toggleOpen}>
              {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </HStack>
        </Flex>
        
        <Text fontSize="sm" color="gray.600">{item.owner}</Text>
        <Text fontSize="sm" color="blue.500">{item.stage}</Text>
        
        {item.attachments && item.attachments.length > 0 && (
        <VStack align="stretch" spacing={2}>
          <Text fontWeight="bold">Attachments:</Text>
          {item.attachments.map((attachment, index) => (
            <HStack key={index}>
              {getFileIcon(attachment.filename)}
              <Link href={attachment.url} isExternal fontSize="sm" color="blue.500">
                {attachment.filename}
              </Link>
            </HStack>
          ))}
        </VStack>
      )}
        
        <HStack className="file-upload-container">
          <Input type="file" onChange={handleFileChange} size="sm" />
          <Button size="sm" onClick={handleSaveFile} isDisabled={!selectedFile}>
            Save File
          </Button>
        </HStack>

        <Collapse in={isOpen}>
          <VStack align="start" spacing={2} mt={2}>
            <Text><strong>Relevans for BI:</strong> {item.relevance_for_bi}</Text>
            <Text><strong>Behov:</strong> {item.need_for_course}</Text>
            <Text><strong>Målgruppe:</strong> {item.target_group}</Text>
            <Text><strong>Vekstpotensial:</strong> {item.growth_potential}</Text>
            <Text><strong>Faglige ressurser:</strong> {item.faculty_resources}</Text>
          </VStack>
        </Collapse>
      </VStack>
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
    axios.put(`http://localhost:5000/tasks/${itemId}`, { caseNumber: newNumber })
      .then(response => {
        setItems(prevItems => prevItems.map(item =>
          item.id === itemId ? { ...item, caseNumber: newNumber } : item
        ));
        reorderItems();
        toast({
          title: "Oppgavenummer oppdatert",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error updating item number:', error);
        toast({
          title: "Feil ved oppdatering av oppgavenummer",
          description: error.response?.data?.error || error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const reorderItems = () => {
    const sortedItems = [...items].sort((a, b) => a.caseNumber - b.caseNumber);
    setItems(sortedItems);
    const newOrder = sortedItems.map(item => item.id);
    axios.post('http://localhost:5000/tasks/reorder', newOrder)
      .then(response => {
        setItems(response.data);
      })
      .catch(error => {
        console.error('Error reordering items:', error);
        toast({
          title: "Feil ved rekkefølgeendring",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleFileUpload = (itemId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    axios.post(`http://localhost:5000/tasks/${itemId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId 
          ? { ...item, attachments: [...(item.attachments || []), response.data.attachment] }
          : item
      ));
      toast({
        title: "File uploaded successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    })
    .catch(error => {
      console.error('Error uploading file:', error);
      toast({
        title: "Error uploading file",
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
      fetchItems();  // Refresh the items list after import
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
              handleFileUpload={handleFileUpload}
            />
          ))}
        </VStack>
        {isAddingItem && (
          <AddItem
            isOpen={isAddingItem}
            onClose={() => {
              setIsAddingItem(false);
              setEditingItem(null);
            }}
            onItemAdded={(item) => {
              if (editingItem) {
                handleUpdate(item);
              } else {
                handleAdd(item);
              }
            }}
            item={editingItem}
          />
        )}
      </Box>
    </DndProvider>
  );
};

export default ItemsList;
