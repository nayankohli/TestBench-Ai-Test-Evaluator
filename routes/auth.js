const express = require('express');
const router = express.Router();
const path = require('path');
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');


router.get("/login", redirectIfAuthenticated, authController.getLoginPage);
router.get("/signup", redirectIfAuthenticated, authController.getSignupPage);
router.get("/", redirectIfAuthenticated, authController.getLoginPage);
router.get("/logout", authController.logout);
router.get("/verify-otp", authController.getVerifyOtpPage);


router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);

module.exports = router;