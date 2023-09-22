const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const LeadCaptureController = require('../controllers/leadCaptureController');

router.post('/', auth, LeadCaptureController.addLeadCapture);
router.get('/', auth, LeadCaptureController.getLeadCaptures);
router.get('/:id', auth, LeadCaptureController.getLeadCaptureById);
router.put('/:id', auth, LeadCaptureController.updateLeadCaptureById);
router.delete('/:id', auth, LeadCaptureController.deleteLeadCaptureById);

router.post('/lead-mail', LeadCaptureController.sendNewLeadMail);

module.exports = router;