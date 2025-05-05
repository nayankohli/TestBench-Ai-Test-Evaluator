const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models');
const { hashPassword } = require('../utils/helpers');
const { redirectIfAuthenticated } = require('../middleware/auth');

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
            res.redirect("/login");
        } else {
            const hashedPassword = hashPassword(req.body.password);
            const newUser = new User({
                name:req.body.username,
                email: req.body.email,
                password: hashedPassword,
                role: req.body.role,
            });

            await newUser.save();
            res.redirect("/login");
        }
    } catch (err) {
        console.error("Signup error:", err);
        res.send("Something went wrong during signup");
    }
});

module.exports = router;