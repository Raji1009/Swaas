const Joi = require('joi');

const mentalHealthSchema = Joi.object({
  patientId: Joi.string().required(),
  anxietyLevel: Joi.number().min(0).max(10).required(),
  depressionLevel: Joi.number().min(0).max(10).required(),
  stressLevel: Joi.number().min(0).max(10).required(),
  mood: Joi.string().valid('happy', 'sad', 'neutral', 'angry', 'anxious').required(),
  notes: Joi.string().optional(),
  date: Joi.date().required(),
});

module.exports = mentalHealthSchema;
