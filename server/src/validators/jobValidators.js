const { body } = require('express-validator');

exports.createJobRules = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3–120 chars'),
  body('category').isIn([
    'Delivery', 'Construction', 'Domestic Help', 'Driver',
    'Warehouse', 'Plumber', 'Electrician', 'Cook', 'Security Guard', 'Other',
  ]).withMessage('Invalid category'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 chars'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('payRate').isFloat({ min: 1, max: 1000000 }).withMessage('Invalid pay rate'),
  body('payType').optional().isIn(['day', 'month', 'job']),
  body('workersNeeded').optional().isInt({ min: 1, max: 500 }),
  body('minExperienceYears').optional().isFloat({ min: 0, max: 50 }),
  body('travelRadiusKm').optional().isInt({ min: 1, max: 100 }),
  body('requiredSkills').optional().isArray({ max: 20 }),
];