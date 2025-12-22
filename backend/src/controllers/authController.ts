import { Request, Response } from 'express';

// very small mock auth controller for local testing
export default class AuthController {
    async register(req: Request, res: Response) {
        const { email } = req.body || {};
        // return a mock token and user
        return res.status(200).json({
            message: 'Registered (mock)',
            token: 'mock-token-' + (email || 'user'),
            user: { id: '1', email: email || 'user@example.com' }
        });
    }

    async login(req: Request, res: Response) {
        const { email } = req.body || {};
        // return mock token
        return res.status(200).json({
            message: 'Logged in (mock)',
            token: 'mock-token-' + (email || 'user'),
            user: { id: '1', email: email || 'user@example.com' }
        });
    }
}