const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const UserControllers = require('../controllers/userController');

router.get('/all', auth, UserControllers.getAllUsers);
router.get('/:id', auth, UserControllers.getProfile);
router.put('/:id', auth, UserControllers.updateUser);
router.put('/block-unblock/:client_id', auth, UserControllers.blockUnblockClientUser);



module.exports = router;