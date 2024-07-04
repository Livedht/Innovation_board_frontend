import React from 'react';
import { Box, Flex, VStack, Heading, Button, useToast } from "@chakra-ui/react";
import axios from 'axios';

const AppLayout = ({ children, onAddNewTask }) => {
  const toast = useToast();

  const handleGenerateReport = () => {
    axios.get('http://localhost:5000/tasks/generate_report')
      .then(response => {
        // Create a Blob from the response data
        const blob = new Blob([response.data.report], { type: 'text/plain' });
        // Create a link element and trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'innovation_board_sakspapirer.txt';
        link.click();
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
            <Button onClick={handleGenerateReport}>Generer sakspapirer</Button>
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