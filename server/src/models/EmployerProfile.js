const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  /* ── Type of employer ── */
  accountType: {
    type: String,
    enum: ['business', 'individual'],
    default: null, // null = not chosen yet
  },

  /* ── Business fields ── */
  businessName: { type: String, default: '' },
  businessType: {
    type: String,
    enum: [
      'restaurant', 'grocery', 'warehouse', 'construction', 'retail',
      'ecommerce', 'services', 'events', 'factory', 'other', '',
    ],
    default: '',
  },
  yearsInBusiness: { type: Number, default: 0, min: 0 },
  employeeCount: String,
  industry: String,
  gstNumber: { type: String, uppercase: true, trim: true },
  panNumber: { type: String, uppercase: true, trim: true },
  businessDocUrl: String,

  /* ── Individual fields ── */
  fullName: String,             // used when accountType === 'individual'
  hireReason: String,           // e.g. "Looking for a cook for my home"
  householdSize: String,        // optional
  idType: {
    type: String,
    enum: ['aadhaar', 'voter', 'dl', 'pan', ''],
    default: '',
  },
  idNumber: String,
  idDocUrl: String,

  /* ── Shared ── */
  ownerName: String,            
  // used for business (owner / manager)
  email: { type: String, lowercase: true, trim: true },
  photoUrl: String,
  description: String,
  selfieUrl: String,
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  },
  serviceRadiusKm: { type: Number, default: 10 },

  /* ── Hiring preferences ── */
  hiringCategories: { type: [String], default: [] },
  contactPhone: { type: String, trim: true, default: '' },
  showContact: { type: Boolean, default: true },


  /* ── Reputation ── */
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  jobsPosted: { type: Number, default: 0 },
  workersHired: { type: Number, default: 0 },
  paymentReliability: { type: Number, default: 100 },

  /* ── Payment ── */
  upiId: String,
  bankAccount: { type: String, select: false },
  ifsc: { type: String, select: false },

  /* ── Verification state ── */
  verification: {
    businessVerified: { type: Boolean, default: false }, // covers both types
    documentUrl: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('EmployerProfile', schema);