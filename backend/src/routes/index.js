const { Router } = require('express');
const AuthController = require('../controllers/authController');
const Patient = require('../models/patient');

const router = Router();
const authController = new AuthController();

const asyncHandler = routeHandler => async (req, res, next) => {
  try {
    await routeHandler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const buildSeedSamples = () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  return Array.from({ length: 10 }, (_value, index) => {
    const i = 9 - index;
    return {
      timestamp: new Date(now - i * day),
      anxiety: Math.max(1, Math.round(3 + Math.sin((i / 9) * Math.PI * 2) * 1.5)),
      depression: Math.max(1, Math.round(2 + Math.cos((i / 9) * Math.PI * 2) * 1.0)),
      stress: Math.max(1, Math.round(4 + Math.sin((i / 5) * Math.PI) * 1.2)),
    };
  });
};

const seedSamplePatient = async () => {
  let patient = await Patient.findOne({ name: 'John Doe' });
  if (!patient) {
    patient = await Patient.create({
      name: 'John Doe',
      age: 34,
      samples: buildSeedSamples(),
      lastVisit: new Date(),
      notes: 'Sample patient data stored in MongoDB with historical samples',
    });
  }

  return patient;
};

const serializePatient = patient => ({
  id: patient._id.toString(),
  name: patient.name,
  age: patient.age,
  mentalHealthMetrics: patient.mentalHealthMetrics,
  samples: patient.samples,
  lastVisit: patient.lastVisit,
  notes: patient.notes,
});

const setRoutes = app => {
  router.post('/login', asyncHandler((req, res) => authController.login(req, res)));
  router.post('/register', asyncHandler((req, res) => authController.register(req, res)));

  router.get('/patients/:id', asyncHandler(async (req, res) => {
    const patient = req.params.id === '1'
      ? await seedSamplePatient()
      : await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.json(serializePatient(patient));
  }));

  router.post('/patients', asyncHandler(async (req, res) => {
    const patient = await Patient.create(req.body);
    return res.status(201).json(serializePatient(patient));
  }));

  router.post('/patients/:id/mental-health', asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.samples.push({
      anxiety: req.body.anxiety,
      depression: req.body.depression,
      stress: req.body.stress,
      timestamp: req.body.timestamp || new Date(),
    });
    patient.lastVisit = new Date();
    await patient.save();

    return res.json(serializePatient(patient));
  }));

  app.use('/api', router);
  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  });
};

module.exports = { setRoutes };
