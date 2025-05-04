const express = require('express');
const router = express.Router();
const { Test, Submission, User } = require('../models');
const { requireAuthentication } = require('../middleware/auth');
const { evaluateAnswer } = require('../utils/helpers');

// Require authentication for all test routes
router.use(requireAuthentication);

// View a specific test
router.get("/:code", async (req, res) => {
    try {
        const test = await Test.findOne({ code: req.params.code });
        if (!test) {
            return res.status(404).render('error', { message: 'Test not found' });
        }

        // Check if test is active (unless user is the teacher)
        if (test.status !== "Active" && req.session.detail.role !== "teacher") {
            return res.status(403).render('error', { message: 'This test is not currently active' });
        }

        res.render("test", {
            test,
            code: req.params.code,
            questions: test.questions
        });
    } catch (err) {
        console.error("Error fetching test:", err);
        res.status(500).render('error', { message: 'Error loading test' });
    }
});

// Submit a test
router.post('/:code/submit', async (req, res) => {
    try {
        const test = await Test.findOne({ code: req.params.code });
        if (!test) {
            return res.status(404).render('error', { message: 'Test not found' });
        }

        const answers = [];
        let totalScore = 0;

        // Process each question and evaluate answer
        for (let i = 0; i < test.questions.length; i++) {
            const answer = req.body[`question${i + 1}`];
            if (answer) {
                answers.push(answer);
                const score = await evaluateAnswer(test.questions[i], answer);
                totalScore += score;
            } else {
                answers.push('');
            }
        }

        // Find user ID based on session email
        const user = await User.findOne({ email: req.session.detail.email });
        if (!user) {
            return res.status(400).render('error', { message: 'User not found' });
        }

        // Save submission using new schema fields
        const newSubmission = new Submission({
            user: user._id,
            test: test._id,
            code: req.params.code,
            questions: test.questions,
            answers: answers,
            score: totalScore
        });

        await newSubmission.save();

        // Redirect based on user role
        if (req.session.detail.role === "student") {
            res.redirect('/student/dashboard');
        } else {
            res.redirect('/teacher/dashboard');
        }
    } catch (error) {
        console.error('Error processing test submission:', error);
        res.status(500).render('error', { message: 'Error submitting test: ' + error.message });
    }
});

module.exports = router;
