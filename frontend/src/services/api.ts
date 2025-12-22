import axios from 'axios';
import { PatientProfileData } from '../types';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
});

export const fetchPatientProfile = async (patientId: string): Promise<PatientProfileData> => {
    try {
        const response = await apiClient.get(`/patients/${patientId}`);
        return response.data;
    } catch (error) {
        const e: any = error;
        throw new Error('Error fetching patient profile: ' + (e.message || String(e)));
    }
};

export const submitMentalHealthData = async (patientId: string, data: any): Promise<any> => {
    try {
        const response = await apiClient.post(`/patients/${patientId}/mental-health`, data);
        return response.data;
    } catch (error) {
        const e: any = error;
        throw new Error('Error submitting mental health data: ' + (e.message || String(e)));
    }
};