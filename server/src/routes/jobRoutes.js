const router = require('express').Router();
const c = require('../controllers/jobController');
const ac = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../validators/validate');
const { createJobRules } = require('../validators/jobValidators');
const assert = require('../utils/assertHandlers');
assert(c, ['listJobs', 'getMatchedJobsForWorker', 'createJob', 'getJob', 'updateJob', 'deleteJob'], 'jobController');
assert(ac, ['apply', 'listApplicationsForJob'], 'applicationController');

router.get('/', protect, c.listJobs);
router.get('/matched', protect, restrictTo('worker'), c.getMatchedJobsForWorker);
router.post('/', protect, restrictTo('employer'), createJobRules, validate, c.createJob);
router.get('/:id', protect, c.getJob);
router.patch('/:id', protect, restrictTo('employer'), c.updateJob);
router.delete('/:id', protect, restrictTo('employer'), c.deleteJob);
router.post('/:id/apply', protect, restrictTo('worker'), ac.apply);
router.get('/:jobId/applications', protect, restrictTo('employer'), ac.listApplicationsForJob);

module.exports = router;