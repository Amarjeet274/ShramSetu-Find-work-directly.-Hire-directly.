const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const c = require('../controllers/voiceController');
router.post('/transcribe', protect, uploadSingle, c.transcribe);
module.exports = router;