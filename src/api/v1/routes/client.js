const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const ClientController = require('../controllers/clientController');

router.post('/', auth, ClientController.addClient);
router.get('/', auth, ClientController.getAllClients);
router.put('/:id', auth, ClientController.updateClient);
router.get('/transactions', auth, ClientController.getAllTransactionsOfClient);
router.get('/:id', auth, ClientController.getClientDetail);
router.get('/conversations/:id', auth, ClientController.getConversationOfClient);
router.post('/conversations/:id', auth, ClientController.addConversationOfClient);

module.exports = router;