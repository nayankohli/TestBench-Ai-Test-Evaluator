const express = require('express');
const router = express.Router();
const path = require('path');
const { User,TempUser } = require('../models');
const { hashPassword } = require('../utils/helpers');
const { redirectIfAuthenticated } = require('../middleware/auth');
const {generateOTP,sendVerificationEmail}=require("../utils/emailService")
router.get("/login", redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

router.get("/signup", redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "signup.html"));
});

router.get("/", redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log("Error destroying session:", err);
            return res.redirect("/");
        }
        res.redirect("/login");
    });
});

router.post("/login", async (req, res) => {
    try {
        const hashedPassword = hashPassword(req.body.password);
        const user = await User.findOne({
            email: req.body.email,
            password: hashedPassword
        });

        if (user) {
            req.session.logedin = true;
            req.session.detail = user;
            req.session.email = user.email;
            req.session.userId=user._id;
            user.role === "teacher"
                ? res.redirect("/teacher/dashboard")
                : res.redirect("/student/dashboard");
        } else {
            res.redirect("/signup");
        }
    } catch (err) {
        console.error("Login error:", err);
        res.redirect("/signup");
    }
});

router.post("/signup", async (req, res) => {
    try {
      const existingUser = await User.findOne({ email: req.body.email });
  
      if (existingUser) {
        return res.render('signup', { error: 'Email already registered. Please login.' });
      }
      const existingTemp = await TempUser.findOne({ email: req.body.email });
      const otp = generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
  
      const hashedPassword = hashPassword(req.body.password);
  
      if (existingTemp) {
        existingTemp.name = req.body.username;
        existingTemp.password = hashedPassword;
        existingTemp.role = req.body.role;
        existingTemp.otp = otp;
        existingTemp.otpExpiry = otpExpiry;
        await existingTemp.save();
      } else {
        const tempUser = new TempUser({
          name: req.body.username,
          email: req.body.email,
          password: hashedPassword,
          role: req.body.role,
          otp: otp,
          otpExpiry: otpExpiry
        });
        await tempUser.save();
      }
  
      await sendVerificationEmail(req.body.email, otp);
  
      res.redirect(`/verify-otp?email=${encodeURIComponent(req.body.email)}`);
  
    } catch (err) {
      console.error("Signup error:", err);
      res.sendFile(path.join(__dirname, "..", "public", "signup.html"), { error: 'Something went wrong during signup' });
    }
  });
  
  router.get("/verify-otp", (req, res) => {
    const email = req.query.email;
    res.render('verify-otp', { email });
  });
  
  router.post("/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      const tempUser = await TempUser.findOne({ email });
  
      if (!tempUser) {
        return res.render('verify-otp', { 
          email, 
          error: 'Verification failed. Please sign up again.' 
        });
      }
  
      if (new Date() > tempUser.otpExpiry) {
        return res.render('verify-otp', { 
          email, 
          error: 'OTP has expired. Please request a new one.' 
        });
      }
      if (tempUser.otp !== otp) {
        return res.render('verify-otp', { 
          email, 
          error: 'Invalid OTP. Please try again.' 
        });
      }
      const newUser = new User({
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        role: tempUser.role
      });
  
      await newUser.save();
      await TempUser.deleteOne({ _id: tempUser._id });
      res.redirect('/login?verified=true');
  
    } catch (err) {
      console.error("OTP verification error:", err);
      res.render('verify-otp', { 
        email: req.body.email, 
        error: 'Something went wrong during verification' 
      });
    }
  });
  router.post("/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;
      const tempUser = await TempUser.findOne({ email });
      
      if (!tempUser) {
        return res.render('verify-otp', { 
          email, 
          error: 'Email not found. Please sign up again.' 
        });
      }
      const otp = generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      tempUser.otp = otp;
      tempUser.otpExpiry = otpExpiry;
      await tempUser.save();
      await sendVerificationEmail(email, otp);
      
      res.render('verify-otp', { 
        email, 
        message: 'A new OTP has been sent to your email' 
      });
      
    } catch (err) {
      console.error("Resend OTP error:", err);
      res.render('verify-otp', { 
        email: req.body.email, 
        error: 'Failed to resend OTP' 
      });
    }
  });

module.exports = router;