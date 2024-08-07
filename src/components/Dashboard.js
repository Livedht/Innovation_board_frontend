import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading, SimpleGrid, VStack, Text, Stat, StatLabel, StatNumber, StatHelpText, Progress, Flex, Badge, useColorModeValue, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import { FaLightbulb, FaBriefcase, FaBook, FaCheckCircle, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import { format, parseISO, isValid, isFuture, isPast } from 'date-fns';
import { nb } from 'date-fns/locale';

const ItemCard = ({ item }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="md" bg={bgColor} borderColor={borderColor}>
      <Flex justify="space-between" align="center">
        <Text fontWeight="bold">{item.casenumber} - {item.title}</Text>
        <Badge colorScheme={
          item.stage === 'Idea Description' ? 'blue' :
            item.stage === 'Business Case' ? 'green' :
              item.stage === 'Course Description' ? 'purple' :
                'gray'
        }>{item.stage}</Badge>
      </Flex>
      <Text mt={2} fontSize="sm" color="gray.500">{item.owner}</Text>
    </Box>
  );
};

const StageSection = ({ title, items, icon }) => {
  const sortedItems = items.sort((a, b) => {
    const aNum = parseInt(a.casenumber.split('/')[0]);
    const bNum = parseInt(b.casenumber.split('/')[0]);
    return aNum - bNum;
  });

  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <Flex align="center">
              {icon}
              <Heading size="md" ml={2}>{title}</Heading>
              <Text ml={2} color="gray.500">({items.length} items)</Text>
            </Flex>
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <VStack spacing={4} align="stretch">
          {sortedItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    ideaDescription: 0,
    businessCase: 0,
    courseDescription: 0,
    completed: 0
  });

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/tasks'),
      axios.get('http://localhost:5000/meetings')
    ])
      .then(([tasksResponse, meetingsResponse]) => {
        setItems(tasksResponse.data);
        setMeetings(meetingsResponse.data);
        calculateStats(tasksResponse.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const calculateStats = (data) => {
    const newStats = {
      total: data.length,
      ideaDescription: data.filter(item => item.stage === 'Idea Description').length,
      businessCase: data.filter(item => item.stage === 'Business Case').length,
      courseDescription: data.filter(item => item.stage === 'Course Description').length,
      completed: data.filter(item => item.stage === 'Completed').length
    };
    setStats(newStats);
  };

  const groupedItems = {
    'Idea Description': items.filter(item => item.stage === 'Idea Description'),
    'Business Case': items.filter(item => item.stage === 'Business Case'),
    'Course Description': items.filter(item => item.stage === 'Course Description'),
    'Completed': items.filter(item => item.stage === 'Completed'),
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

  const nextMeeting = meetings
    .filter(meeting => isFuture(parseISO(meeting.date)))
    .sort((a, b) => parseISO(a.date) - parseISO(b.date))[0];

  const completedMeetings = meetings.filter(meeting => isPast(parseISO(meeting.date)));

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>

      <SimpleGrid columns={[2, null, 4]} spacing={6} mb={10}>
        {['Total Cases', 'Idea Description', 'Business Case', 'Course Description'].map((label, index) => (
          <Stat key={label} bg={bgColor} p={4} borderRadius="md" borderWidth={1} borderColor={borderColor} boxShadow="sm">
            <StatLabel>{label}</StatLabel>
            <StatNumber>{stats[Object.keys(stats)[index]]}</StatNumber>
            <StatHelpText>
              {index === 0 ? 'All stages' : `${((stats[Object.keys(stats)[index]] / stats.total) * 100).toFixed(1)}%`}
            </StatHelpText>
          </Stat>
        ))}
      </SimpleGrid>

      <Box mb={10} bg={bgColor} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor} boxShadow="sm">
        <Heading size="md" mb={4}>Progress Overview</Heading>
        <Progress value={(stats.completed / stats.total) * 100} size="lg" colorScheme="green" />
        <Text mt={2} textAlign="right">{stats.completed} of {stats.total} completed</Text>
      </Box>

      <SimpleGrid columns={[1, null, 2]} spacing={6} mb={10}>
        <Box bg={bgColor} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor} boxShadow="sm">
          <Flex align="center" mb={4}>
            <FaCalendarAlt color="#3182CE" />
            <Heading size="md" ml={2}>Next Meeting</Heading>
          </Flex>
          {nextMeeting ? (
            <VStack align="start" spacing={2}>
              <Text><strong>Date:</strong> {formatDate(nextMeeting.date)}</Text>
              <Text><strong>Number:</strong> {nextMeeting.number}</Text>
              <Text><strong>Location:</strong> {nextMeeting.location}</Text>
            </VStack>
          ) : (
            <Text>No upcoming meetings scheduled</Text>
          )}
        </Box>
        <Box bg={bgColor} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor} boxShadow="sm">
          <Flex align="center" mb={4}>
            <FaHistory color="#718096" />
            <Heading size="md" ml={2}>Completed Meetings</Heading>
          </Flex>
          <Text><strong>Total completed:</strong> {completedMeetings.length}</Text>
          <Text><strong>Last meeting:</strong> {completedMeetings.length > 0 ? formatDate(completedMeetings[completedMeetings.length - 1].date) : 'N/A'}</Text>
        </Box>
      </SimpleGrid>

      <Box bg={bgColor} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor} boxShadow="sm">
        <Heading size="md" mb={6}>Stages Overview</Heading>
        <Accordion allowMultiple>
          <StageSection title="Idea Description" items={groupedItems['Idea Description']} icon={<FaLightbulb color="#3182CE" />} />
          <StageSection title="Business Case" items={groupedItems['Business Case']} icon={<FaBriefcase color="#38A169" />} />
          <StageSection title="Course Description" items={groupedItems['Course Description']} icon={<FaBook color="#805AD5" />} />
          <StageSection title="Completed" items={groupedItems['Completed']} icon={<FaCheckCircle color="#718096" />} />
        </Accordion>
      </Box>
    </Box>
  );
};

export default Dashboard;