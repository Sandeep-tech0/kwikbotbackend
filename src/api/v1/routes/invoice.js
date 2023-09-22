const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const InvoiceController = require('../controllers/invoiceController');

router.get('/', auth, InvoiceController.getInvoiceByClientId);
router.post('/', auth, InvoiceController.createInvoice);
router.delete('/:id', auth, InvoiceController.deleteInvoice);
router.get('/all', auth, InvoiceController.allInvoices);


module.exports = router;