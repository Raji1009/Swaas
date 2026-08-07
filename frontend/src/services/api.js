import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || DEFAULT_API_URL,
    timeout: 10000,
});

const buildApiError = (action, error) => {
    const serverMessage = error?.response?.data?.message;
    if (serverMessage) {
        return new Error(`${action}: ${serverMessage}`);
    }

    if (error?.request) {
        return new Error(`${action}: Unable to reach the API at ${apiClient.defaults.baseURL}. Please make sure the backend server is running.`);
    }

    return new Error(`${action}: ${error.message || String(error)}`);
};

export const login = async credentials => {
    try {
        const response = await apiClient.post('/login', credentials);
        return response.data;
    } catch (error) {
        throw buildApiError('Login failed', error);
    }
};

export const register = async credentials => {
    try {
        const response = await apiClient.post('/register', credentials);
        return response.data;
    } catch (error) {
        throw buildApiError('Registration failed', error);
    }
};

export const fetchPatientProfile = async patientId => {
    try {
        const response = await apiClient.get(`/patients/${patientId}`);
        return response.data;
    } catch (error) {
        throw buildApiError('Error fetching patient profile', error);
    }
};

export const submitMentalHealthData = async (patientId, data) => {
    try {
        const response = await apiClient.post(`/patients/${patientId}/mental-health`, data);
        return response.data;
    } catch (error) {
        throw buildApiError('Error submitting mental health data', error);
    }
};
