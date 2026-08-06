const User = require('../models/user');

class AuthController {
  async register(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password });
    return res.status(201).json({
      message: 'Registered',
      token: `mock-token-${user._id}`,
      user: { id: user._id, email: user.email },
    });
  }

  async login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Logged in',
      token: `mock-token-${user._id}`,
      user: { id: user._id, email: user.email },
    });
  }
}

module.exports = AuthController;
