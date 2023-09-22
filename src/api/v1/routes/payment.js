const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const PaymentController = require('../controllers/paymentController');

router.post('/create-order', auth, PaymentController.createPayPalPayment);
router.post('/capture', auth, PaymentController.completeOrder);
router.post('/cancel-order', auth, PaymentController.cancelOrder);
router.get('/all', auth, PaymentController.getAllTransactions);
router.get('/admin/client/:client_id', auth, PaymentController.getAllTransactionsByClientId);

module.exports = router;