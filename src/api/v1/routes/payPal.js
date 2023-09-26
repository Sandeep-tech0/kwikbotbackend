const express = require('express');
const router = express.Router();
const payPalController = require('../controllers/payPalController');
const auth = require("../middlewares/auth");

// Define API endpoints
router.post('/complete-subscription',auth, payPalController.completeSubscription);
router.post('/paypal-action',auth, payPalController.performPayPalActions); 
router.post('/cancel-renewal', auth ,payPalController.cancelRenewal);  
router.post('/webhook',auth ,payPalController.webhook)                                                       

module.exports = router;
