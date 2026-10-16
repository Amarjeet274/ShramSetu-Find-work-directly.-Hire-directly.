const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const c = require('../controllers/uploadController');

router.post('/single', protect, uploadSingle, c.uploadSingle);
router.post('/multiple', protect, uploadMultiple, c.uploadMultiple);
module.exports = router;