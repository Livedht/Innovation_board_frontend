import React from 'react';
import { Route, Routes } from 'react-router-dom';
import TasksList from './components/ItemsList';
import MeetingList from './components/MeetingList';
import Dashboard from './components/Dashboard';

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/saksdatabase" element={<TasksList />} />
        <Route path="/moter" element={<MeetingList />} />
    </Routes>
);

export default AppRoutes;