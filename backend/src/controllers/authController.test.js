jest.mock('mongoose', () => ({
  connection: { readyState: 0 },
}));

jest.mock('../models/user', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const User = require('../models/user');
const AuthController = require('./authController');

describe('AuthController fallback mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user when MongoDB is unavailable', async () => {
    const controller = new AuthController();
    const req = { body: { email: 'demo@example.com', password: 'secret' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.register(req, res);

    expect(User.findOne).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Registered' }));
  });
});
