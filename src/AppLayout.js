import React from 'react';
import { Box, Flex, VStack, Heading, Button, useToast, Spacer } from "@chakra-ui/react";
import axios from 'axios';
import { Link } from 'react-router-dom';

const AppLayout = ({ children, onAddNewTask }) => {
  const toast = useToast();

  const handleGenerateReport = () => {
    axios.get('http://localhost:5000/tasks/generate_report', { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'innovation_board_sakspapirer.docx');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast({
          title: "Rapport generert",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error generating report:', error);
        toast({
          title: "Feil ved generering av rapport",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleAddNewMeeting = () => {
    const newMeeting = {
      number: '02/24',
      date: new Date().toISOString().split('T')[0] // Just an example, should be user input
    };
    axios.post('http://localhost:5000/meetings', newMeeting)
      .then(response => {
        toast({
          title: "Møte lagt til",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error('Error adding meeting:', error);
        toast({
          title: "Feil ved tillegg av møte",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <Box minH="100vh">
      <Flex bg="blue.600" color="white" p={4} alignItems="center">
        <Heading size="lg">Innovation Board Executive</Heading>
        <Spacer />
        <Button as={Link} to="/saksdatabase" colorScheme="blue" variant="outline" mr={2}>
          Saksdatabase
        </Button>
        <Button as={Link} to="/moter" colorScheme="blue" variant="outline" mr={2}>
          Møter
        </Button>
        <Button colorScheme="blue" onClick={onAddNewTask} mr={2}>
          Legg til ny idé
        </Button>
        <Button colorScheme="blue" onClick={handleGenerateReport} mr={2}>
          Generer sakspapirer
        </Button>
        <Button colorScheme="blue" onClick={handleAddNewMeeting}>
          Legg til nytt møte
        </Button>
      </Flex>

      <Flex>
        <Box w="200px" bg="gray.100" p={4}>
          <VStack spacing={4} align="stretch">
            {/* Fjernet knappene fra sidebaren */}
          </VStack>
        </Box>

        <Box flex={1} p={4}>
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default AppLayout;
