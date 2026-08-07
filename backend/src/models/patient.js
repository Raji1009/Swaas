const mongoose = require('mongoose');

const mentalHealthMetricSchema = new mongoose.Schema(
  {
    anxiety: { type: Number, min: 0, max: 10, required: true },
    depression: { type: Number, min: 0, max: 10, required: true },
    stress: { type: Number, min: 0, max: 10, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0, max: 120, required: true },
    email: { type: String, trim: true, lowercase: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    samples: { type: [mentalHealthMetricSchema], default: [] },
    lastVisit: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

patientSchema.virtual('mentalHealthMetrics').get(function getMentalHealthMetrics() {
  const latest = this.samples[this.samples.length - 1] || { anxiety: 0, depression: 0, stress: 0 };
  return {
    anxietyLevel: latest.anxiety,
    depressionLevel: latest.depression,
    stressLevel: latest.stress,
  };
});

patientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
