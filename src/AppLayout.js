import React from 'react';
import { Box, Flex, VStack, Heading, Button, useToast } from "@chakra-ui/react";
import axios from 'axios';

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

  return (
    <Box minH="100vh">
      <Box bg="blue.600" color="white" p={4}>
        <Heading size="lg">Innovation Board Executive</Heading>
      </Box>

      <Flex>
        <Box w="200px" bg="gray.100" p={4}>
          <VStack spacing={4} align="stretch">
            <Button colorScheme="blue" onClick={onAddNewTask}>
              Legg til ny idé
            </Button>
            <Button colorScheme="blue" onClick={handleGenerateReport}>
              Generer sakspapirer
            </Button>
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