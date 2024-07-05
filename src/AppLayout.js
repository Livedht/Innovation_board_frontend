import React from 'react';
import { Box, Flex, Heading, Button, Spacer } from "@chakra-ui/react";
import { Link, useLocation } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const location = useLocation();

  return (
    <Box minH="100vh">
      <Flex bg="blue.600" color="white" p={4} alignItems="center">
        <Heading size="lg">Innovation Board Executive</Heading>
        <Spacer />
        <Button as={Link} to="/saksdatabase" colorScheme="blue" mr={2}>
          Saksdatabase
        </Button>
        <Button as={Link} to="/moter" colorScheme="blue" mr={2}>
          Møter
        </Button>
      </Flex>

      <Box p={4}>
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;