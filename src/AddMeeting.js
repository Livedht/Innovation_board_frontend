import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import axios from 'axios';

const AddMeeting = ({ isOpen, onClose, onMeetingAdded }) => {
  const [date, setDate] = useState('');
  const [number, setNumber] = useState('');
  const [location, setLocation] = useState('A4Y-117');
  const toast = useToast();

  const handleSubmit = (event) => {
    event.preventDefault();

    const newMeeting = {
      date,
      number,
      location,
    };

    axios.post('http://localhost:5000/meetings', newMeeting)
      .then(response => {
        onMeetingAdded(response.data);
        toast({
          title: "Møte lagt til",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        onClose();
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Legg til nytt møte</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>Dato</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel>Møtenummer</FormLabel>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel>Sted</FormLabel>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Legg til
          </Button>
          <Button variant="ghost" onClick={onClose}>Avbryt</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddMeeting;
