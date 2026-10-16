const router = require('express').Router();
const c = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const validate = require('../validators/validate');
const { createReviewRules } = require('../validators/reviewValidators');

router.post('/', protect, createReviewRules, validate, c.create);
router.get('/workers/:id', c.forWorker);
router.get('/employers/:id', c.forEmployer);

module.exports = router;