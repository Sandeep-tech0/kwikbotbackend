const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');


router.post('/login', AuthController.login);
router.post('/superAdmin/login', AuthController.loginForSuperAdmin);
router.post('/register', AuthController.registerClientUser);
router.post('/change-password', AuthController.updatePassword);
router.post('/reset/password', AuthController.resetPassword);   
router.post('/verify/otp', AuthController.verifyOtp);
router.post('/change/resetPassword', AuthController.changePassword);
router.post('/set/password', AuthController.setPassword);


module.exports = router;