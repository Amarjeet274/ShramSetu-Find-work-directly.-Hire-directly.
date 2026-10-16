const { body } = require('express-validator');

exports.createReviewRules = [
  body('assignmentId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').optional().trim().isLength({ max: 1000 }),
];