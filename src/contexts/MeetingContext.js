import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const MeetingContext = createContext();

export const MeetingProvider = ({ children }) => {
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/meetings');
            setMeetings(response.data);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        }
    };

    return (
        <MeetingContext.Provider value={{ meetings, setMeetings, fetchMeetings }}>
            {children}
        </MeetingContext.Provider>
    );
};

export const useMeeting = () => useContext(MeetingContext);