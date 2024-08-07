import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Box, VStack, HStack, Heading, Text, Button, IconButton, Collapse, Input, Link, Flex, Spacer, useToast, InputGroup, InputLeftElement, Table, Thead, Tbody, Tr, Th, Td, Select } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon, SearchIcon } from '@chakra-ui/icons';
import { FaFilePdf, FaFileExcel, FaFileWord, FaFileAlt } from 'react-icons/fa';
import AddItem from './AddItem';

const ItemCard = ({ item, handleEdit, handleDelete, handleNumberChange, handleFileUpload, handleStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemNumber, setItemNumber] = useState(item.casenumber || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [meetingHistory, setMeetingHistory] = useState([]);

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    // Fetch meeting history for this item
    axios.get(`http://localhost:5000/tasks/${item.id}/meetings`)
      .then(response => {
        setMeetingHistory(response.data);
      })
      .catch(error => {
        console.error('Error fetching meeting history:', error);
      });
  }, [item.id]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed and Approved':
        return 'green.500';
      case 'Stopped':
        return 'red.500';
      case 'Not Approved':
        return 'orange.500';
      default:
        return 'blue.500';
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
            onBlur={handleItemNumberBlur}
            width="100px"
            mr={2}
            placeholder="Item #"
          />
          <Heading size="md" flex={1}>{item.title}</Heading>
          <Spacer />
          <HStack>
            <Select
              size="sm"
              value={item.completion_status}
              onChange={(e) => handleStatusChange(item.id, e.target.value)}
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed and Approved">Completed and Approved</option>
              <option value="Stopped">Stopped</option>
              <option value="Not Approved">Not Approved</option>
            </Select>
            <IconButton size="sm" icon={<EditIcon />} onClick={() => handleEdit(item)} />
            <IconButton size="sm" icon={<DeleteIcon />} colorScheme="red" onClick={() => handleDelete(item.id)} />
            <Button size="sm" onClick={toggleOpen}>
              {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </HStack>
        </Flex>

        <Text fontSize="sm" color="gray.600">{item.owner}</Text>
        <Text fontSize="sm" color="blue.500">{item.stage}</Text>
        <Text fontSize="sm" color={getStatusColor(item.completion_status)}>{item.completion_status}</Text>

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

            <Box width="100%">
              <Heading size="sm" mb={2}>Meeting History</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Meeting Date</Th>
                    <Th>Meeting Number</Th>
                    <Th>Stage at Meeting</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {meetingHistory.map((meeting, index) => (
                    <Tr key={index}>
                      <Td>{new Date(meeting.date).toLocaleDateString()}</Td>
                      <Td>{meeting.number}</Td>
                      <Td>{meeting.stage_at_meeting}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const fetchItems = useCallback(() => {
    axios.get('http://localhost:5000/tasks')
      .then(response => {
        console.log('Fetched items:', response.data);
        const sortedItems = response.data.sort((a, b) => {
          const aNum = parseInt(a.casenumber?.split('/')[0] || '0');
          const bNum = parseInt(b.casenumber?.split('/')[0] || '0');
          return aNum - bNum;
        });
        setItems(sortedItems);
        setFilteredItems(sortedItems);
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

  useEffect(() => {
    const filtered = items.filter(item =>
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.casenumber && item.casenumber.includes(searchTerm)) ||
      (item.owner && item.owner.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsAddingItem(true);
  };

  const handleDelete = (itemId) => {
    axios.delete(`http://localhost:5000/tasks/${itemId}`)
      .then(() => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        setFilteredItems(prevItems => prevItems.filter(item => item.id !== itemId));
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
        setFilteredItems(prevItems => prevItems.map(item =>
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
        setItems(prevItems => {
          const updatedItems = [...prevItems, response.data];
          return updatedItems.sort((a, b) => {
            const aNum = parseInt(a.casenumber?.split('/')[0] || '0');
            const bNum = parseInt(b.casenumber?.split('/')[0] || '0');
            return aNum - bNum;
          });
        });
        setFilteredItems(prevItems => {
          const updatedItems = [...prevItems, response.data];
          return updatedItems.sort((a, b) => {
            const aNum = parseInt(a.casenumber?.split('/')[0] || '0');
            const bNum = parseInt(b.casenumber?.split('/')[0] || '0');
            return aNum - bNum;
          });
        });
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
    axios.put(`http://localhost:5000/tasks/${itemId}`, { casenumber: newNumber })
      .then(response => {
        setItems(prevItems => {
          const updatedItems = prevItems.map(item =>
            item.id === itemId ? { ...item, casenumber: newNumber } : item
          );
          return updatedItems.sort((a, b) => {
            const aNum = parseInt(a.casenumber?.split('/')[0] || '0');
            const bNum = parseInt(b.casenumber?.split('/')[0] || '0');
            return aNum - bNum;
          });
        });
        setFilteredItems(prevItems => {
          const updatedItems = prevItems.map(item =>
            item.id === itemId ? { ...item, casenumber: newNumber } : item
          );
          return updatedItems.sort((a, b) => {
            const aNum = parseInt(a.casenumber?.split('/')[0] || '0');
            const bNum = parseInt(b.casenumber?.split('/')[0] || '0');
            return aNum - bNum;
          });
        });
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
        setFilteredItems(prevItems => prevItems.map(item =>
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

  const handleStatusChange = (itemId, newStatus) => {
    axios.put(`http://localhost:5000/tasks/${itemId}/status`, { status: newStatus })
      .then(response => {
        setItems(prevItems => prevItems.map(item =>
          item.id === itemId ? { ...item, completion_status: newStatus } : item
        ));
        setFilteredItems(prevItems => prevItems.map(item =>
          item.id === itemId ? { ...item, completion_status: newStatus } : item
        ));
        toast({
          title: "Status updated",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error updating item status:', error);
        toast({
          title: "Error updating status",
          description: error.response?.data?.error || error.message,
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
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Søk etter saker..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>
      <VStack spacing={4} align="stretch" width="100%">
        {filteredItems.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            index={index}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleNumberChange={handleNumberChange}
            handleFileUpload={handleFileUpload}
            handleStatusChange={handleStatusChange}
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
  );
};

export default ItemsList;