// src/components/Dashboard.js
import React from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/react";
import { useTask } from '../contexts/TaskContext';
import { useMeeting } from '../contexts/MeetingContext';

const Dashboard = () => {
    const { tasks } = useTask();
    const { meetings } = useMeeting();

    return (
        <Box>
            <Heading mb={6} color="blue.100">Dashboard</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                <Stat bg="white" p={5} borderRadius="md" boxShadow="md">
                    <StatLabel color="blue.90">Total Tasks</StatLabel>
                    <StatNumber color="blue.100">{tasks.length}</StatNumber>
                    <StatHelpText color="blue.70">In the database</StatHelpText>
                </Stat>
                <Stat bg="white" p={5} borderRadius="md" boxShadow="md">
                    <StatLabel color="blue.90">Upcoming Meetings</StatLabel>
                    <StatNumber color="blue.100">{meetings.length}</StatNumber>
                    <StatHelpText color="blue.70">Scheduled</StatHelpText>
                </Stat>
                <Stat bg="white" p={5} borderRadius="md" boxShadow="md">
                    <StatLabel color="blue.90">Tasks in Progress</StatLabel>
                    <StatNumber color="blue.100">{tasks.filter(task => task.stage !== 'Completed').length}</StatNumber>
                    <StatHelpText color="blue.70">Active tasks</StatHelpText>
                </Stat>
            </SimpleGrid>
        </Box>
    );
};

export default Dashboard;