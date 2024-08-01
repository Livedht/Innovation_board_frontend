import React from 'react';
import { Box, Flex, Heading, Spacer, Image } from "@chakra-ui/react";
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const AppLayout = ({ children }) => {
  return (
    <Box minH="100vh" bg="blue.5">
      <Flex bg="blue.100" color="white" p={4} alignItems="center">
        <Image src={logo} alt="Company Logo" height="40px" mr={4} />
        <Heading size="lg" fontWeight={500}>Innovation Board Executive</Heading>
        <Spacer />
        <Link to="/saksdatabase" style={{ marginRight: '1rem' }}>Saksdatabase</Link>
        <Link to="/moter">Møter</Link>
      </Flex>
      <Box p={8}>
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;