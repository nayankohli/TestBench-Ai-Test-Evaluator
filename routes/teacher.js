const express = require('express');
const router = express.Router();
const path = require('path');
const { Test, Submission, User } = require('../models');
const { requireAuthentication, requireTeacherRole } = require('../middleware/auth');
const { generateCode } = require('../utils/helpers');

// Middleware to ensure teacher is authenticated
router.use(requireAuthentication, requireTeacherRole);

// Teacher dashboard
router.get("/dashboard", async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const tests = await Test.find({ teacher: teacherId });

        const user = await User.findById(teacherId);
        res.render("teacherDashboard", {
            data: tests || [],
            user: user?.name || "Unknown Teacher"
        });
    } catch (err) {
        console.error("Error fetching tests:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Serve test creation page
router.get("/createTest", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "createTest.html"));
});

// Handle test creation
router.post("/createTest", async (req, res) => {
    try {
        const questionsArray = Array.from({ length: parseInt(req.body.numberOfQuestions) }, (_, i) => {
            return req.body[`question${i + 1}`] || null;
        }).filter(Boolean);

        const newTest = new Test({
            subject: req.body.subject,
            topic: req.body.topic,
            totalQuestions: questionsArray.length,
            questions: questionsArray,
            teacher: req.session.userId,
            code: generateCode(),
            status: "Inactive"
        });

        await newTest.save();
        res.redirect("/teacher/dashboard");
    } catch (err) {
        console.error("Error creating test:", err);
        res.send("Error creating test");
    }
});

// Activate a test
router.post("/activate/:code", async (req, res) => {
    try {
        const updatedTest = await Test.findOneAndUpdate(
            { code: req.params.code },
            { status: "Active" },
            { new: true }
        );

        res.json({
            success: !!updatedTest,
            message: updatedTest ? "Test activated successfully" : "Test not found",
            data: updatedTest
        });
    } catch (err) {
        console.error("Error activating test:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// View scores for a test
router.get('/scores/:code', async (req, res) => {
    try {
        const test = await Test.findOne({ code: req.params.code });
        if (!test) {
            return res.status(404).render('error', { message: 'Test not found' });
        }

        const submissions = await Submission.find({ test: test._id })
            .populate('student', 'name email') // Include student info
            .sort({ createdAt: -1 });

        res.render('scores', {
            submissions: submissions || [],
            test,
            success: true,
            message: submissions.length === 0 ? 'No submissions found for this test' : null
        });
    } catch (error) {
        console.error('Error fetching scores:', error);
        res.status(500).render('error', { message: 'Error fetching scores' });
    }
});

// Edit test
router.get('/edit/:code', async (req, res) => {
    try {
        const test = await Test.findOne({ code: req.params.code });
        if (!test) {
            return res.status(404).render('error', { message: 'Test not found' });
        }
        res.render('edittest', { test });
    } catch (error) {
        console.error('Error fetching test for edit:', error);
        res.status(500).render('error', { message: 'Error fetching test details' });
    }
});

// Update test
router.post('/edit/:code', async (req, res) => {
    try {
        const updatedTest = await Test.findOneAndUpdate(
            { code: req.params.code },
            {
                $set: {
                    subject: req.body.subject,
                    topic: req.body.topic,
                    totalQuestions: req.body.questions.length,
                    questions: req.body.questions,
                    status: req.body.status
                }
            },
            { new: true }
        );

        if (!updatedTest) {
            return res.status(404).render('error', { message: 'Test not found' });
        }

        res.redirect('/teacher/dashboard');
    } catch (error) {
        console.error('Error updating test:', error);
        res.status(500).render('error', { message: 'Error updating test' });
    }
});

// Delete test and its submissions
router.delete('/delete/:code', async (req, res) => {
    try {
        const test = await Test.findOneAndDelete({ code: req.params.code });
        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        await Submission.deleteMany({ test: test._id });

        res.json({
            success: true,
            message: 'Test and associated submissions deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting test',
            error: error.message
        });
    }
});

// Inactivate test
router.post("/inactive/:code", async (req, res) => {
    try {
        const updatedTest = await Test.findOneAndUpdate(
            { code: req.params.code },
            { status: "Inactive" },
            { new: true }
        );

        res.json({
            success: !!updatedTest,
            message: updatedTest ? "Test inactivated successfully" : "Test not found",
            data: updatedTest
        });
    } catch (err) {
        console.error("Error inactivating test:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
