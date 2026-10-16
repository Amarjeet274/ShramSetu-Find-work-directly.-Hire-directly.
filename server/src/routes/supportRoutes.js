const router = require('express').Router();
const c = require('../controllers/supportController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../validators/validate');
const { createTicketRules } = require('../validators/supportValidators');

router.post('/tickets', protect, createTicketRules, validate, c.createTicket);
router.get('/tickets', protect, c.listMyTickets);
router.post('/tickets/:id/messages', protect, c.addMessage);
router.get('/admin/tickets', protect, restrictTo('support', 'admin'), c.listAll);
router.patch('/admin/tickets/:id', protect, restrictTo('support', 'admin'), c.updateStatus);

module.exports = router;