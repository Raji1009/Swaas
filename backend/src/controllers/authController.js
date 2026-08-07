const mongoose = require('mongoose');
const User = require('../models/user');
const Patient = require('../models/patient');

const fallbackUsers = new Map();
const fallbackPatients = new Map();

const normalizeEmail = email => String(email || '').trim().toLowerCase();
const normalizeName = (name, email) => String(name || '').trim() || email.split('@')[0] || 'Patient';
const normalizeAge = age => {
  const parsed = Number(age);
  return Number.isFinite(parsed) ? parsed : 0;
};

const useDatabase = () => mongoose.connection.readyState === 1 && Boolean(mongoose.connection.db);

const serializePatient = patient => ({
  id: patient._id ? patient._id.toString() : patient.id,
  name: patient.name,
  age: patient.age,
  email: patient.email,
  samples: patient.samples || [],
  lastVisit: patient.lastVisit,
  mentalHealthMetrics: patient.mentalHealthMetrics || {
    anxietyLevel: 0,
    depressionLevel: 0,
    stressLevel: 0,
  },
});

class AuthController {
  async register(req, res) {
    const { email, password, name, age } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    const patientName = normalizeName(name, normalizedEmail);
    const patientAge = normalizeAge(age);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (useDatabase()) {
      try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(409).json({ message: 'User already exists' });
        }

        const user = await User.create({ email: normalizedEmail, password });
        const patient = await Patient.create({
          name: patientName,
          age: patientAge,
          email: normalizedEmail,
          userId: user._id,
        });

        return res.status(201).json({
          message: 'Registered',
          token: `mock-token-${user._id}`,
          user: { id: user._id, email: user.email },
          patient: serializePatient(patient),
        });
      } catch (error) {
        console.warn('MongoDB auth registration failed; using fallback mode.', error.message);
      }
    }

    if (fallbackUsers.has(normalizedEmail)) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const fallbackUser = {
      id: `fallback-${Date.now()}`,
      email: normalizedEmail,
      password,
    };
    const fallbackPatient = {
      id: `patient-${Date.now()}`,
      name: patientName,
      age: patientAge,
      email: normalizedEmail,
      samples: [],
      lastVisit: new Date().toISOString(),
      mentalHealthMetrics: {
        anxietyLevel: 0,
        depressionLevel: 0,
        stressLevel: 0,
      },
    };
    fallbackUsers.set(normalizedEmail, fallbackUser);
    fallbackPatients.set(normalizedEmail, fallbackPatient);

    return res.status(201).json({
      message: 'Registered',
      token: `mock-token-${fallbackUser.id}`,
      user: { id: fallbackUser.id, email: fallbackUser.email },
      patient: fallbackPatient,
    });
  }

  async login(req, res) {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (useDatabase()) {
      try {
        const user = await User.findOne({ email: normalizedEmail, password });
        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const patient = await Patient.findOne({ email: normalizedEmail, userId: user._id });
        return res.status(200).json({
          message: 'Logged in',
          token: `mock-token-${user._id}`,
          user: { id: user._id, email: user.email },
          patient: patient ? serializePatient(patient) : null,
        });
      } catch (error) {
        console.warn('MongoDB auth login failed; using fallback mode.', error.message);
      }
    }

    const fallbackUser = fallbackUsers.get(normalizedEmail);
    const fallbackPatient = fallbackPatients.get(normalizedEmail);
    if (!fallbackUser || fallbackUser.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Logged in',
      token: `mock-token-${fallbackUser.id}`,
      user: { id: fallbackUser.id, email: fallbackUser.email },
      patient: fallbackPatient || null,
    });
  }
}

module.exports = AuthController;
