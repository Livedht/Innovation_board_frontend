import React from 'react';
import { Box, VStack, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import DraggableTask from './DraggableTask';

const TaskSidebar = ({ tasks }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box>
      <IconButton
        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
        onClick={isOpen ? onClose : onOpen}
        position="fixed"
        top={4}
        right={4}
        zIndex={10}
      />
      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Tasks</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {tasks.map(task => (
                <DraggableTask key={task.id} task={task} />
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default TaskSidebar;
