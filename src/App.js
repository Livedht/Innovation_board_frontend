import React, { useState } from 'react';
import { ChakraProvider, Flex } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TasksList from './TasksList';
import AddTask from './AddTask';
import AppLayout from './AppLayout';
import MeetingList from './MeetingList';
import MeetingDetails from './MeetingDetails';

function App() {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const handleAddNewTask = () => {
    setIsAddingTask(true);
  };

  return (
    <ChakraProvider>
      <Router>
        <AppLayout onAddNewTask={handleAddNewTask}>
          <Routes>
            <Route path="/saksdatabase" element={
              <>
                <TasksList />
                {isAddingTask && (
                  <AddTask
                    onTaskAdded={() => setIsAddingTask(false)}
                    onCancel={() => setIsAddingTask(false)}
                  />
                )}
              </>
            } />
            <Route path="/moter" element={
              <>
                <MeetingList onSelectMeeting={setSelectedMeeting} />
                {selectedMeeting && <MeetingDetails meeting={selectedMeeting} />}
              </>
            } />
            <Route path="/" element={
              <>
                <TasksList />
                {isAddingTask && (
                  <AddTask
                    onTaskAdded={() => setIsAddingTask(false)}
                    onCancel={() => setIsAddingTask(false)}
                  />
                )}
              </>
            } />
          </Routes>
        </AppLayout>
      </Router>
    </ChakraProvider>
  );
}

export default App;
