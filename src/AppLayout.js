import React from 'react';
import { Box, Flex, VStack, Heading, Button } from "@chakra-ui/react";

const AppLayout = ({ children, onAddNewTask }) => {
  return (
    <Box minH="100vh">
      {/* Header */}
      <Box bg="blue.600" color="white" p={4}>
        <Heading size="lg">Innovation Board Executive</Heading>
      </Box>

      <Flex>
        {/* Sidebar */}
        <Box w="200px" bg="gray.100" p={4}>
          <VStack spacing={4} align="stretch">
            <Button colorScheme="blue" onClick={onAddNewTask}>
              Legg til ny idé
            </Button>
            <Button>Generer sakspapirer</Button>
          </VStack>
        </Box>

        {/* Main content */}
        <Box flex={1} p={4}>
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default AppLayout;