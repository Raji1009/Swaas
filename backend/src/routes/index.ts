import { Router, Application } from 'express';
import AuthController from '../controllers/authController';

const router = Router();
const authController = new AuthController();

export const setRoutes = (app: Application) => {
    router.post('/login', (req, res) => authController.login(req, res));
    router.post('/register', (req, res) => authController.register(req, res));
    // Add more routes as needed
    // mock patients endpoint for demo
    router.get('/patients/:id', (req, res) => {
        const { id } = req.params;
        // generate sample historical data (last 10 days)
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const samples: Array<any> = [];
        for (let i = 9; i >= 0; i--) {
            const timestamp = new Date(now - i * day).toISOString();
            // simple oscillation to make a visible trend
            const anxiety = Math.max(1, Math.round(3 + Math.sin((i / 9) * Math.PI * 2) * 1.5));
            const depression = Math.max(1, Math.round(2 + Math.cos((i / 9) * Math.PI * 2) * 1.0));
            const stress = Math.max(1, Math.round(4 + Math.sin((i / 5) * Math.PI) * 1.2));
            samples.push({ timestamp, anxiety, depression, stress });
        }

        const sample = {
            id,
            name: 'John Doe',
            age: 34,
            mentalHealthMetrics: {
                anxietyLevel: samples[samples.length - 1].anxiety,
                depressionLevel: samples[samples.length - 1].depression,
                stressLevel: samples[samples.length - 1].stress
            },
            samples,
            lastVisit: new Date(),
            notes: 'Sample patient data with historical samples'
        };
        res.json(sample);
    });

    app.use('/api', router);
};