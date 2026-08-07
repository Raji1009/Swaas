import axios from 'axios';

// For production builds (Vercel, GitHub Pages) set REACT_APP_API_BASE_URL
// e.g. REACT_APP_API_BASE_URL=https://my-backend.example.com/api
const DEFAULT_API_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '/api';
const USERS_STORAGE_KEY = 'swaas-demo-users';
const AUTH_STORAGE_KEY = 'swaas-auth-session';

const apiClient = axios.create({
    baseURL: DEFAULT_API_URL,
    timeout: 10000,
});

export const getApiBase = () => DEFAULT_API_URL;

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

const getStoredSession = () => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
};

const isNetworkError = error => Boolean(error?.request) && !error?.response;

const readDemoUsers = () => {
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return rawUsers ? JSON.parse(rawUsers) : [];
};

const writeDemoUsers = users => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const createDemoSession = ({ email, password, name, age, notes }) => {
    const patient = {
        id: `demo-${Date.now()}`,
        name: name || email.split('@')[0],
        age: Number(age) || 0,
        email,
        notes: notes || '',
        samples: [],
        lastVisit: new Date().toISOString(),
        mentalHealthMetrics: {
            anxietyLevel: 0,
            depressionLevel: 0,
            stressLevel: 0,
        },
    };

    return {
        message: 'Demo session started',
        token: `demo-token-${Date.now()}`,
        user: { id: email, email },
        patient,
        offline: true,
    };
};

const saveSession = session => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export { getStoredSession };

const loginOffline = credentials => {
    const users = readDemoUsers();
    const user = users.find(savedUser => savedUser.email === credentials.email && savedUser.password === credentials.password);

    if (!user) {
        throw new Error('Login failed: No matching demo account was found. Register first, or start the backend API for database login.');
    }

    const session = createDemoSession({ ...credentials, name: user.name, age: user.age, notes: user.notes });
    saveSession(session);
    return session;
};

const registerOffline = credentials => {
    const users = readDemoUsers();
    if (users.some(savedUser => savedUser.email === credentials.email)) {
        throw new Error('Registration failed: Demo user already exists. Please login instead.');
    }

    const nextUsers = [...users, { ...credentials, password: credentials.password, name: credentials.name || '', age: credentials.age || 0, notes: credentials.notes || '' }];
    writeDemoUsers(nextUsers);
    const session = createDemoSession(credentials);
    saveSession(session);
    return session;
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
        const session = response.data;
        saveSession(session);
        return session;
    } catch (error) {
        if (isNetworkError(error)) {
            const session = loginOffline(credentials);
            saveSession(session);
            return session;
        }

        throw buildApiError('Login failed', error);
    }
};

export const register = async credentials => {
    try {
        const response = await apiClient.post('/register', credentials);
        const session = response.data;
        saveSession(session);
        return session;
    } catch (error) {
        if (isNetworkError(error)) {
            const session = registerOffline(credentials);
            saveSession(session);
            return session;
        }

        throw buildApiError('Registration failed', error);
    }
};

export const resetPassword = async ({ email, newPassword }) => {
    const users = readDemoUsers();
    const user = users.find(savedUser => savedUser.email === email);

    if (!user) {
        throw new Error('Password reset failed: no account was found for that email.');
    }

    const updatedUsers = users.map(savedUser => savedUser.email === email ? { ...savedUser, password: newPassword } : savedUser);
    writeDemoUsers(updatedUsers);
    return { message: 'Password reset successful', email };
};

export const fetchPatientProfile = async patientId => {
    const storedSession = getStoredSession();
    if (storedSession?.patient && String(storedSession.patient.id) === String(patientId)) {
        return storedSession.patient;
    }

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
