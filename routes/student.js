const express = require('express');
const router = express.Router();
const { Test, Submission,User } = require('../models');
const { requireAuthentication, requireStudentRole } = require('../middleware/auth');
const mongoose = require('mongoose');

router.use(requireAuthentication, requireStudentRole);

router.get("/dashboard", async (req, res) => {
    try {
        const userId = req.session.userId; 
        const tests = await Test.find({ status: "Active" }).populate('teacher', 'name email').sort({ createdAt: -1 });
        const submissions = await Submission.find({ student: userId }).select('test');
        const completedTestIds = new Set(submissions.map(sub => sub.test.toString()));
        const testsWithCompletionStatus = tests.map(test => {
            const testObj = test.toObject();
            testObj.completed = completedTestIds.has(test._id.toString());
            return testObj;
        });
        const user=await User.findOne({_id:userId});
        res.render("studentDashboard", { data: testsWithCompletionStatus || [],user });
    } catch (err) {
        console.error("Error fetching tests:", err);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/scores", requireAuthentication, requireStudentRole, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        const submissions = await Submission.find({ student: userId })
            .populate({
                path: 'test',
                select: 'subject topic createdAt totalMarks'
            })
            .sort({ createdAt: -1 }); 
        
        res.render("studentScores", { submissions });
    } catch (err) {
        console.error("Error fetching scores:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/api/submission/:id", requireAuthentication, requireStudentRole, async (req, res) => {
    try {
        const submissionId = req.params.id;
        const userId = req.session.userId;
        
        const submission = await Submission.findOne({ 
            _id: submissionId,
            student: userId
        }).populate({
            path: 'test',
            select: 'subject topic code totalQuestions totalMarks questions status testDuration'
        });
        
        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }
        
        if (typeof submission.obtainedMarks === 'undefined' || isNaN(submission.obtainedMarks)) {
            let obtainedMarks = 0;
            
            if (submission.marks) {
                try {
                    const marksArray = submission.marks.split(',').map(Number);
                    obtainedMarks = marksArray.reduce((sum, mark) => !isNaN(mark) ? sum + mark : sum, 0);
                } catch (e) {
                    console.error("Error parsing marks:", e);
                    obtainedMarks = 0;
                }
            }
            
            submission.obtainedMarks = obtainedMarks;
        }
        
        if (submission.test && (typeof submission.test.totalMarks === 'undefined' || isNaN(submission.test.totalMarks))) {
            if (submission.test.questions && Array.isArray(submission.test.questions)) {
                submission.test.totalMarks = submission.test.questions.reduce((sum, q) => 
                    sum + (q.marks && !isNaN(q.marks) ? q.marks : 0), 0);
            } else {
                submission.test.totalMarks = 0;
            }
        }
        
        res.json({ submission });
    } catch (err) {
        console.error("Error fetching submission details:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
