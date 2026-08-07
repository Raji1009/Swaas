import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:5000/api';
const USERS_STORAGE_KEY = 'swaas-demo-users';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || DEFAULT_API_URL,
    timeout: 10000,
});

const buildSeedSamples = () => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    return Array.from({ length: 10 }, (_value, index) => {
        const i = 9 - index;
        return {
            timestamp: new Date(now - i * day).toISOString(),
            anxiety: Math.max(1, Math.round(3 + Math.sin((i / 9) * Math.PI * 2) * 1.5)),
            depression: Math.max(1, Math.round(2 + Math.cos((i / 9) * Math.PI * 2) * 1.0)),
            stress: Math.max(1, Math.round(4 + Math.sin((i / 5) * Math.PI) * 1.2)),
        };
    });
};

const samplePatient = {
    id: '1',
    name: 'John Doe',
    age: 34,
    samples: buildSeedSamples(),
    lastVisit: new Date().toISOString(),
    notes: 'Sample patient data available while the backend API is offline.',
    mentalHealthMetrics: {
        anxietyLevel: 3,
        depressionLevel: 2,
        stressLevel: 4,
    },
};

const isNetworkError = error => Boolean(error?.request) && !error?.response;

const readDemoUsers = () => {
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return rawUsers ? JSON.parse(rawUsers) : [];
};

const writeDemoUsers = users => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const createDemoSession = email => ({
    message: 'Demo session started',
    token: `demo-token-${Date.now()}`,
    user: { id: email, email },
    offline: true,
});

const loginOffline = ({ email, password }) => {
    const users = readDemoUsers();
    const user = users.find(savedUser => savedUser.email === email && savedUser.password === password);

    if (!user) {
        throw new Error('Login failed: No matching demo account was found. Register first, or start the backend API for database login.');
    }

    return createDemoSession(email);
};

const registerOffline = ({ email, password }) => {
    const users = readDemoUsers();
    if (users.some(savedUser => savedUser.email === email)) {
        throw new Error('Registration failed: Demo user already exists. Please login instead.');
    }

    writeDemoUsers([...users, { email, password }]);
    return createDemoSession(email);
};

const buildApiError = (action, error) => {
    const serverMessage = error?.response?.data?.message;
    if (serverMessage) {
        return new Error(`${action}: ${serverMessage}`);
    }

    return new Error(`${action}: ${error.message || String(error)}`);
};

export const login = async credentials => {
    try {
        const response = await apiClient.post('/login', credentials);
        return response.data;
    } catch (error) {
        if (isNetworkError(error)) {
            return loginOffline(credentials);
        }

        throw buildApiError('Login failed', error);
    }
};

export const register = async credentials => {
    try {
        const response = await apiClient.post('/register', credentials);
        return response.data;
    } catch (error) {
        if (isNetworkError(error)) {
            return registerOffline(credentials);
        }

        throw buildApiError('Registration failed', error);
    }
};

export const fetchPatientProfile = async patientId => {
    try {
        const response = await apiClient.get(`/patients/${patientId}`);
        return response.data;
    } catch (error) {
        if (isNetworkError(error) && patientId === '1') {
            return samplePatient;
        }

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
