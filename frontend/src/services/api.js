import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
});

export const fetchPatientProfile = async patientId => {
    try {
        const response = await apiClient.get(`/patients/${patientId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching patient profile: ' + (error.message || String(error)));
    }
};

export const submitMentalHealthData = async (patientId, data) => {
    try {
        const response = await apiClient.post(`/patients/${patientId}/mental-health`, data);
        return response.data;
    } catch (error) {
        throw new Error('Error submitting mental health data: ' + (error.message || String(error)));
    }
};