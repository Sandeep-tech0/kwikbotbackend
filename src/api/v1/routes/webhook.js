const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Define API endpoints
router.post('/subscription-cancelled',  webhookController.webhookSubscriptionCancelled);
router.post('/subscription-expired',  webhookController.webhookSubscriptionExpired);
router.post('/subscription-suspended',  webhookController.webhookSubscriptionSuspended);
router.post('/subscription-complete', webhookController.webhookSubscriptioncompleted);
router.post('/subscription-payment-failed', webhookController.webhookSubscriptionPaymentFailed);


                                                

module.exports = router;
