// src/App.js
import React from 'react';
import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Routes from './routes';
import { TaskProvider } from './contexts/TaskContext';
import { MeetingProvider } from './contexts/MeetingContext';
import theme from './styles/theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <TaskProvider>
          <MeetingProvider>
            <AppLayout>
              <Box p={4}>
                <Routes />
              </Box>
            </AppLayout>
          </MeetingProvider>
        </TaskProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
