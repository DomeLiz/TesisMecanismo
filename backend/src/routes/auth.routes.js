const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);

router.post('/verify-otp', authController.verifyOTP); // Nueva ruta para verificar OTP

router.post('/send-otp', authController.sendOtpToCustodiado); 
router.post('/verify-otp-custodiado', authController.verifyOtpToCustodiado); // Ruta para verificar OTP del custodiado


module.exports = router;
