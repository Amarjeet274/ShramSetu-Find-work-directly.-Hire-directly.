const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployerProfile', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere', required: true },
  },
  address: String,
  travelRadiusKm: { type: Number, default: 5 },
  schedule: {
    startDate: Date,
    shift: { type: String, enum: ['morning', 'afternoon', 'night', 'full_day', 'flexible'] },
    workingDays: String,
  },
  payRate: { type: Number, required: true },
  payType: { type: String, enum: ['day', 'month', 'job'], default: 'day' },
  workersNeeded: { type: Number, default: 1 },
  workersHired: { type: Number, default: 0 },
  minExperienceYears: { type: Number, default: 0 },
  status: {
    type: String,
    enum: [
      'DRAFT', 'POSTED', 'APPLIED', 'SHORTLISTED', 'HIRED', 'IN_PROGRESS',
      'COMPLETION_REQUESTED', 'COMPLETED', 'PAYMENT_PENDING', 'PAID',
      'CANCELLED', 'DISPUTED',
    ],
    default: 'POSTED',
  },
}, { timestamps: true });

schema.index(
  { title: 'text', description: 'text', category: 'text' },
  { language_override: 'searchLanguage' }   // tells Mongo to look at 'searchLanguage' instead
);

module.exports = mongoose.model('Job', schema);