const { body } = require('express-validator');

exports.createReportRules = [
  body('targetType').isIn(['user', 'job', 'review']),
  body('targetId').isMongoId(),
  body('reason').trim().isLength({ min: 3, max: 200 }),
  body('details').optional().trim().isLength({ max: 1000 }),
];