const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const BillingInfoController = require('../controllers/billingInfoController');

router.get('/', auth, BillingInfoController.getBillingInfoByClientId);
router.put('/', auth, BillingInfoController.updateBillingInfo);


module.exports = router;