import React, { useState } from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import TasksList from './TasksList';
import AddTask from './AddTask';
import AppLayout from './AppLayout';

function App() {
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleAddNewTask = () => {
    setIsAddingTask(true);
  };

  return (
    <ChakraProvider>
      <AppLayout onAddNewTask={handleAddNewTask}>
        <TasksList />
        {isAddingTask && (
          <AddTask
            onTaskAdded={() => setIsAddingTask(false)}
            onCancel={() => setIsAddingTask(false)}
          />
        )}
      </AppLayout>
    </ChakraProvider>
  );
}

export default App;