const express = require('express');
const router = express.Router();
const payPalController = require('../controllers/payPalController');
const auth = require("../middlewares/auth");

// Define API endpoints
router.post('/complete-subscription',auth, payPalController.completeSubscription);
router.post('/paypal-action',auth, payPalController.performPayPalActions); 
                                                  

module.exports = router;
