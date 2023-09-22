const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const SubscriptionPlanController = require('../controllers/subscriptionPlanController');

router.put('/client/:client_id', auth, SubscriptionPlanController.updateClientSubscription);
router.get('/client', auth, SubscriptionPlanController.getClientSubscriptionByClientId);
router.put('/cancel/client', auth, SubscriptionPlanController.CancelClientSubscription);


module.exports = router;