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
  Select,  // Import Select component
  useToast
} from "@chakra-ui/react";

const AddTask = ({ onTaskAdded, onCancel, task }) => {
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [description, setDescription] = useState('');
  const [relevanceForBI, setRelevanceForBI] = useState('');
  const [needForCourse, setNeedForCourse] = useState('');
  const [targetGroup, setTargetGroup] = useState('');
  const [growthPotential, setGrowthPotential] = useState('');
  const [facultyResources, setFacultyResources] = useState('');
  const [stage, setStage] = useState('Idea Description');  // Set default stage to "Idea Description"

  const toast = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setOwner(task.owner);
      setDescription(task.description);
      setRelevanceForBI(task.relevanceForBI);
      setNeedForCourse(task.needForCourse);
      setTargetGroup(task.targetGroup);
      setGrowthPotential(task.growthPotential);
      setFacultyResources(task.facultyResources);
      setStage(task.stage);  // Set stage if editing
    }
  }, [task]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const newTask = {
      title,
      owner,
      description,
      relevanceForBI,
      needForCourse,
      targetGroup,
      growthPotential,
      facultyResources,
      stage  // Include stage in new task
    };

    if (task) {
      axios.put(`http://localhost:5000/tasks/${task.id}`, newTask)
        .then(response => {
          onTaskAdded(response.data);
          toast({
            title: "Oppgave oppdatert",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
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
      axios.post('http://localhost:5000/tasks', newTask)
        .then(response => {
          onTaskAdded(response.data);
          toast({
            title: "Oppgave lagt til",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
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
    <Modal isOpen={true} onClose={onCancel}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{task ? 'Rediger idé' : 'Legg til ny idé'}</ModalHeader>
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
                <Textarea value={relevanceForBI} onChange={(e) => setRelevanceForBI(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Behov for kurset/idéen</FormLabel>
                <Textarea value={needForCourse} onChange={(e) => setNeedForCourse(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Målgruppe</FormLabel>
                <Textarea value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Vekstpotensial</FormLabel>
                <Textarea value={growthPotential} onChange={(e) => setGrowthPotential(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Faglige ressurser</FormLabel>
                <Textarea value={facultyResources} onChange={(e) => setFacultyResources(e.target.value)} required />
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
            {task ? 'Oppdater' : 'Legg til'}
          </Button>
          <Button variant="ghost" onClick={onCancel}>Avbryt</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddTask;
