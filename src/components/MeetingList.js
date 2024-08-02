// src/components/MeetingList.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Box, VStack, Button, useToast, Heading, HStack, Input, IconButton, Flex, Text, Collapse, Grid, GridItem, Textarea } from "@chakra-ui/react";
import { DeleteIcon, HamburgerIcon, CloseIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import AddMeeting from './AddMeeting';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format, parseISO, isValid } from 'date-fns';
import { nb } from 'date-fns/locale';

const DraggableTask = ({ task, onDropTask }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Box
      ref={drag}
      opacity={isDragging ? 0.5 : 1}
      cursor="move"
      p={3}
      bg="white"
      borderWidth="1px"
      borderRadius="md"
      boxShadow="sm"
    >
      <VStack align="start" spacing={1}>
        <Text fontSize="sm" color="gray.500">{task.caseNumber}</Text>
        <Heading size="sm">{task.title}</Heading>
        <Text fontSize="sm">{task.owner}</Text>
        <Text fontSize="sm" color="blue.500">{task.stage}</Text>
      </VStack>
    </Box>
  );
};

const DroppableMeeting = ({ meeting, onDropTask, onRemoveTask, onToggleExpand, isExpanded, onGenerateReport, onGenerateMinutes, onDeleteMeeting, onUpdateMinutes }) => {
  const [, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => onDropTask(meeting.id, item.id),
  });

  const [minutesInputs, setMinutesInputs] = useState({});

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        throw new Error('Invalid date');
      }
      return format(date, "d. MMMM yyyy", { locale: nb });
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Invalid Date';
    }
  };

  const formattedDate = formatDate(meeting.date);

  const handleMinutesChange = (taskId, value) => {
    setMinutesInputs(prev => ({ ...prev, [taskId]: value }));
  };

  const handleSaveMinutes = (taskId) => {
    onUpdateMinutes(meeting.id, taskId, minutesInputs[taskId] || '');
    setMinutesInputs(prev => ({ ...prev, [taskId]: undefined }));
  };

  return (
    <Box ref={drop} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md">
      <Flex justify="space-between" align="center" p={4} bg="gray.50">
        <Heading size="md">{meeting.number} - {formattedDate}</Heading>
        <HStack>
          <Button size="sm" onClick={() => onToggleExpand(meeting.id)}>
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
          <Button size="sm" onClick={() => onGenerateReport(meeting.id)}>
            Generer sakspapirer
          </Button>
          <Button size="sm" onClick={() => onGenerateMinutes(meeting.id)}>
            Generer møtereferat
          </Button>
          <IconButton
            size="sm"
            icon={<DeleteIcon />}
            colorScheme="red"
            onClick={() => onDeleteMeeting(meeting.id)}
            aria-label="Delete meeting"
          />
        </HStack>
      </Flex>
      <Collapse in={isExpanded} animateOpacity>
        <VStack spacing={2} align="stretch" p={4}>
          {meeting.tasks && meeting.tasks.map(task => (
            <Box key={task.id} p={3} bg="white" borderWidth="1px" borderRadius="md" boxShadow="sm">
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">{task.caseNumber}</Text>
                  <Heading size="sm">{task.title}</Heading>
                  <Text fontSize="sm">{task.owner}</Text>
                  <Text fontSize="sm" color="blue.500">{task.stage}</Text>
                </VStack>
                <IconButton
                  size="sm"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => onRemoveTask(meeting.id, task.id)}
                  aria-label="Remove task from meeting"
                />
              </Flex>
              <Box mt={2}>
                <Text fontSize="sm" fontWeight="bold">Møtereferat:</Text>
                <Textarea
                  value={minutesInputs[task.id] !== undefined ? minutesInputs[task.id] : task.minutes || ''}
                  onChange={(e) => handleMinutesChange(task.id, e.target.value)}
                  placeholder="Skriv møtereferat her..."
                  size="sm"
                />
                <Button
                  mt={2}
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleSaveMinutes(task.id)}
                >
                  Lagre møtereferat
                </Button>
              </Box>
            </Box>
          ))}
        </VStack>
      </Collapse>
    </Box>
  );
};

const MeetingList = ({ onSelectMeeting }) => {
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [expandedMeetings, setExpandedMeetings] = useState({});
  const toast = useToast();

  const fetchMeetings = useCallback(() => {
    axios.get('http://localhost:5000/meetings')
      .then(response => {
        console.log('Fetched meetings:', response.data);
        setMeetings(response.data);
      })
      .catch(error => {
        console.error('Error fetching meetings:', error);
        toast({
          title: "Feil ved henting av møter",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [toast]);

  const fetchTasks = useCallback(() => {
    axios.get('http://localhost:5000/tasks')
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        toast({
          title: "Feil ved henting av oppgaver",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [toast]);

  useEffect(() => {
    fetchMeetings();
    fetchTasks();
  }, [fetchMeetings, fetchTasks]);

  const handleAddMeeting = (newMeeting) => {
    axios.post('http://localhost:5000/meetings', newMeeting)
      .then(response => {
        setMeetings(prevMeetings => [...prevMeetings, response.data]);
        toast({
          title: "Møte lagt til",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setIsAddingMeeting(false);
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

  const handleDeleteMeeting = (meetingId) => {
    axios.delete(`http://localhost:5000/meetings/${meetingId}`)
      .then(() => {
        setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== meetingId));
        toast({
          title: "Møte slettet",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        toast({
          title: "Feil ved sletting av møte",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleDropTask = (meetingId, taskId) => {
    const meeting = meetings.find(m => m.id === meetingId);
    const task = tasks.find(t => t.id === taskId);

    if (meeting && task) {
      axios.post(`http://localhost:5000/meetings/${meetingId}/tasks`, { task_id: taskId })
        .then(() => {
          setMeetings(prevMeetings => prevMeetings.map(m => {
            if (m.id === meetingId) {
              return { ...m, tasks: [...m.tasks, task] };
            }
            return m;
          }));
        })
        .catch(error => {
          toast({
            title: "Feil ved tillegg av oppgave til møte",
            description: error.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  const handleRemoveTask = (meetingId, taskId) => {
    axios.delete(`http://localhost:5000/meetings/${meetingId}/tasks/${taskId}`)
      .then(() => {
        setMeetings(prevMeetings => prevMeetings.map(m => {
          if (m.id === meetingId) {
            return { ...m, tasks: m.tasks.filter(task => task.id !== taskId) };
          }
          return m;
        }));
        toast({
          title: "Oppgave fjernet fra møte",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        toast({
          title: "Feil ved fjerning av oppgave fra møte",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleToggleExpand = (meetingId) => {
    setExpandedMeetings(prevState => ({
      ...prevState,
      [meetingId]: !prevState[meetingId],
    }));
  };

  const handleGenerateReport = (meetingId) => {
    axios.get(`http://localhost:5000/meetings/${meetingId}/generate_report`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `meeting_${meetingId}_report.docx`);
        document.body.appendChild(link);
        link.click();
        toast({
          title: "Rapport generert",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        toast({
          title: "Feil ved generering av rapport",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleGenerateMinutes = (meetingId) => {
    axios.get(`http://localhost:5000/meetings/${meetingId}/generate_minutes`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `meeting_${meetingId}_minutes.docx`);
        document.body.appendChild(link);
        link.click();
        toast({
          title: "Møtereferat generert",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        toast({
          title: "Feil ved generering av møtereferat",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleUpdateMinutes = (meetingId, taskId, minutes) => {
    axios.put(`http://localhost:5000/meetings/${meetingId}/tasks/${taskId}`, { minutes })
      .then(() => {
        setMeetings(prevMeetings => prevMeetings.map(meeting => {
          if (meeting.id === meetingId) {
            return {
              ...meeting,
              tasks: meeting.tasks.map(task =>
                task.id === taskId ? { ...task, minutes } : task
              )
            };
          }
          return meeting;
        }));
        toast({
          title: "Møtereferat lagret",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        toast({
          title: "Feil ved lagring av møtereferat",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        throw new Error('Invalid date');
      }
      return format(date, "d. MMMM yyyy", { locale: nb });
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Invalid Date';
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const formattedDate = formatDate(meeting.date);
    return meeting.number.includes(filter) || formattedDate.includes(filter);
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">Møter</Heading>
          <Button colorScheme="blue" onClick={() => setIsAddingMeeting(true)}>
            Legg til nytt møte
          </Button>
        </Flex>
        <Input
          placeholder="Filter møter etter nummer eller dato"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          mb={4}
        />
        <Grid templateColumns={isSidebarOpen ? "2fr 1fr" : "1fr"} gap={4}>
          <GridItem>
            <VStack spacing={4} align="stretch">
              {filteredMeetings.map(meeting => (
                <DroppableMeeting
                  key={meeting.id}
                  meeting={meeting}
                  onDropTask={handleDropTask}
                  onRemoveTask={handleRemoveTask}
                  onToggleExpand={handleToggleExpand}
                  isExpanded={expandedMeetings[meeting.id]}
                  onGenerateReport={handleGenerateReport}
                  onGenerateMinutes={handleGenerateMinutes}
                  onDeleteMeeting={handleDeleteMeeting}
                  onUpdateMinutes={handleUpdateMinutes}
                />
              ))}
            </VStack>
          </GridItem>
          {isSidebarOpen && (
            <GridItem>
              <Box bg="gray.100" p={4} borderRadius="md" boxShadow="md" height="100%">
                <Heading size="md" mb={4}>Oppgaver</Heading>
                <VStack spacing={4} align="stretch" overflowY="auto" maxHeight="calc(100vh - 200px)">
                  {tasks.map(task => (
                    <DraggableTask key={task.id} task={task} onDropTask={handleDropTask} />
                  ))}
                </VStack>
              </Box>
            </GridItem>
          )}
        </Grid>
        <IconButton
          icon={isSidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
          onClick={handleSidebarToggle}
          position="fixed"
          top={4}
          right={4}
          zIndex={10}
        />
        {isAddingMeeting && (
          <AddMeeting
            isOpen={isAddingMeeting}
            onClose={() => setIsAddingMeeting(false)}
            onMeetingAdded={handleAddMeeting}
          />
        )}
      </Box>
    </DndProvider>
  );
};

export default MeetingList;