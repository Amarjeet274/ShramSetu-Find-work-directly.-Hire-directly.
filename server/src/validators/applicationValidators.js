const { body, param } = require('express-validator');

exports.applyRules = [
  param('id').isMongoId().withMessage('Invalid job id'),
  body('coverNote').optional().trim().isLength({ max: 500 }),
];

exports.updateStatusRules = [
  param('id').isMongoId(),
  body('status').isIn(['VIEWED', 'SHORTLISTED', 'HIRED', 'REJECTED', 'WITHDRAWN']),
];