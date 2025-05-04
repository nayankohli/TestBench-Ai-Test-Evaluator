const express = require('express');
const router = express.Router();
const { Test, Submission } = require('../models');
const { requireAuthentication, requireStudentRole } = require('../middleware/auth');
const mongoose = require('mongoose');

// Use both middleware to ensure user is authenticated and is a student
router.use(requireAuthentication, requireStudentRole);

// Student dashboard — fetch all active tests
router.get("/dashboard", async (req, res) => {
    try {
        const tests = await Test.find({ status: "Active" }).populate('teacher', 'name email');
        res.render("studentDashboard", { data: tests || [] });
    } catch (err) {
        console.error("Error fetching tests:", err);
        res.status(500).send("Internal Server Error");
    }
});

// View test scores for a student
router.get('/myScores', async (req, res) => {
    try {
        const studentId = req.session.userId;  // Assuming userId is stored in session on login

        const submissions = await Submission.find({ student: studentId })
            .populate('test') // populates test field with subject, topic, etc.
            .sort({ createdAt: -1 });

        // Prepare data for rendering
        const scoreData = submissions.map(sub => {
            return {
                subject: sub.test?.subject || 'N/A',
                topic: sub.test?.topic || 'N/A',
                marks: sub.marks,
                submittedAt: sub.createdAt
            };
        });

        res.render('myScores', { 
            scores: scoreData,
            success: true
        });
    } catch (error) {
        console.error('Error fetching scores:', error);
        res.status(500).render('error', { message: 'Error fetching your scores' });
    }
});

module.exports = router;
