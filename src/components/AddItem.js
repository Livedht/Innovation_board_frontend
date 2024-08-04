// src/components/AddItem.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Textarea,
  VStack,
  Select,
  useToast
} from "@chakra-ui/react";

const AddItem = ({ isOpen, onClose, onItemAdded, item }) => {
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [description, setDescription] = useState('');
  const [relevance_for_bi, setRelevanceForBI] = useState('');
  const [need_for_course, setNeedForCourse] = useState('');
  const [target_group, setTargetGroup] = useState('');
  const [growth_potential, setGrowthPotential] = useState('');
  const [faculty_resources, setFacultyResources] = useState('');
  const [stage, setStage] = useState('Idea Description');

  const toast = useToast();

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setOwner(item.owner);
      setDescription(item.description);
      setRelevanceForBI(item.relevance_for_bi);
      setNeedForCourse(item.need_for_course);
      setTargetGroup(item.target_group);
      setGrowthPotential(item.growth_potential);
      setFacultyResources(item.faculty_resources);
      setStage(item.stage);
    }
  }, [item]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const newItem = {
      title,
      owner,
      description,
      relevance_for_bi,
      need_for_course,
      target_group,
      growth_potential,
      faculty_resources,
      stage
    };

    if (item) {
      axios.put(`http://localhost:5000/tasks/${item.id}`, newItem)
        .then(response => {
          onItemAdded(response.data);
          toast({
            title: "Oppgave oppdatert",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
          onClose();
        })
        .catch(error => {
          console.error('Error updating task:', error);
          toast({
            title: "Feil ved oppdatering av oppgave",
            description: error.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    } else {
      axios.post('http://localhost:5000/tasks', newItem)
        .then(response => {
          onItemAdded(response.data);
          toast({
            title: "Oppgave lagt til",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
          onClose();
        })
        .catch(error => {
          console.error('Error adding task:', error);
          toast({
            title: "Feil ved tillegg av oppgave",
            description: error.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{item ? 'Rediger idé' : 'Legg til ny idé'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Idénavn</FormLabel>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Idéeier</FormLabel>
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Beskrivelse av idéen</FormLabel>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Relevans for BI</FormLabel>
                <Textarea value={relevance_for_bi} onChange={(e) => setRelevanceForBI(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Behov for kurset/idéen</FormLabel>
                <Textarea value={need_for_course} onChange={(e) => setNeedForCourse(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Målgruppe</FormLabel>
                <Textarea value={target_group} onChange={(e) => setTargetGroup(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Vekstpotensial</FormLabel>
                <Textarea value={growth_potential} onChange={(e) => setGrowthPotential(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Faglige ressurser</FormLabel>
                <Textarea value={faculty_resources} onChange={(e) => setFacultyResources(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select value={stage} onChange={(e) => setStage(e.target.value)} required>
                  <option value="Idea Description">Idea Description</option>
                  <option value="Business Case">Business Case</option>
                  <option value="Course Description">Course Description</option>
                  <option value="Completed">Completed</option>
                </Select>
              </FormControl>
            </VStack>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            {item ? 'Oppdater' : 'Legg til'}
          </Button>
          <Button variant="ghost" onClick={onClose}>Avbryt</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddItem;