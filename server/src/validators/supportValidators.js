const { body } = require('express-validator');

exports.createTicketRules = [
  body('category').isIn([
    'Payment', 'Account', 'Verification', 'Job', 'Employer',
    'Worker', 'Technical problem', 'Safety', 'Other',
  ]),
  body('subject').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 5, max: 2000 }),
];