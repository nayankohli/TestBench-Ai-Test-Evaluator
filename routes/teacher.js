const express = require('express');
const router = express.Router();
const path = require('path');
const { Test, Submission, User } = require('../models');
const { requireAuthentication, requireTeacherRole } = require('../middleware/auth');
const { generateCode,generateQuestions } = require('../utils/helpers');

router.use(requireAuthentication, requireTeacherRole);

router.get("/dashboard", async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const tests = await Test.find({ teacher: teacherId }).sort({createdAt:-1});

        const user = await User.findById(teacherId);
        res.render("teacherDashboard", {
            data: tests || [],
            user: user || "Unknown Teacher"
        });
    } catch (err) {
        console.error("Error fetching tests:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/createTest", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "createTest.html"));
});

router.post("/createTest", async (req, res) => {
    try {
        if (!req.body.subject || !req.body.topic) {
            return res.status(400).send("Subject and topic are required");
        }
        
        const oneMarkerCount = parseInt(req.body.oneMarkerCount) || 0;
        const twoMarkerCount = parseInt(req.body.twoMarkerCount) || 0;
        const fiveMarkerCount = parseInt(req.body.fiveMarkerCount) || 0;
        
        const totalQuestions = oneMarkerCount + twoMarkerCount + fiveMarkerCount;
        const totalMarks = parseInt(req.body.totalMarks) || 0;
        
        const questions = [];
        
        for (let i = 1; i <= totalQuestions; i++) {
            const questionId = req.body[`questionId_${i}`];
            
            if (questionId) {
                const question = {
                    id: questionId,
                    question: req.body[`question_${i}`],
                    answer: req.body[`answer_${i}`],
                    type: req.body[`questionType_${i}`],
                    marks: parseInt(req.body[`questionMarks_${i}`])
                };
                
                questions.push(question);
            }
        }
        
        const newTest = new Test({
            subject: req.body.subject,
            topic: req.body.topic,
            totalQuestions: totalQuestions,
            questions: questions,
            teacher: req.session.userId,
            code: generateCode(),
            status: req.body.status || "Inactive",
            totalMarks: totalMarks,
            testDuration: req.body.testDuration ? parseInt(req.body.testDuration) : null
        });
        
        await newTest.save();
        res.redirect("/teacher/dashboard");
    } catch (err) {
        console.error("Error creating test:", err);
        res.status(500).send("Error creating test");
    }
});

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

router.get('/scores/:code', async (req, res) => {
    try {
        const test = await Test.findOne({ code: req.params.code });
        if (!test) {
            return res.status(404).render('error', { message: 'Test not found' });
        }

        const submissions = await Submission.find({ test: test._id })
            .populate('student', 'name email') 
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

router.post('/edit/:code', async (req, res) => {
    try {
        const formattedQuestions = req.body.questions.map((questionText, index) => {
            const questionType = req.body.questionTypes && req.body.questionTypes[index] 
                ? req.body.questionTypes[index] 
                : '1-marker';
            if (typeof questionText === 'object' && questionText !== null) {
                return questionText;
            }
            return {
                question: questionText,
                type: questionType
            };
        });

        const updatedTest = await Test.findOneAndUpdate(
            { code: req.params.code },
            {
                $set: {
                    subject: req.body.subject,
                    topic: req.body.topic,
                    totalQuestions: formattedQuestions.length,
                    questions: formattedQuestions,
                    status: req.body.status,
                    duration: req.body.testDuration 
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

router.get('/aitest', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", 'aiTest.html'));
  });
  
  router.post('/aitest', async (req, res) => {
    try {
      const { subject, topic } = req.body;
      const oneMarkerCount = parseInt(req.body['1-marker-questions']) || 0;
      const twoMarkerCount = parseInt(req.body['2-marker-questions']) || 0;
      const fiveMarkerCount = parseInt(req.body['5-marker-questions']) || 0;
      
      // Validation
      if (!subject || !topic) {
        return res.status(400).send('Subject and topic are required');
      }
      
      if (oneMarkerCount + twoMarkerCount + fiveMarkerCount <= 0) {
        return res.status(400).send('Please select at least one question');
      }
      
      const generatedQuestions = await generateQuestions(subject, topic, oneMarkerCount, twoMarkerCount, fiveMarkerCount);
      
      console.log(`Generated test for ${subject}/${topic} with ${generatedQuestions.length} questions`);
      if (generatedQuestions.length === 0) {
        return res.status(500).send('Failed to generate questions. Please try again.');
      }
      
      req.session.generatedTest = {
        subject,
        topic,
        questions: generatedQuestions,
        totalMarks: (oneMarkerCount * 1) + (twoMarkerCount * 2) + (fiveMarkerCount * 5),
        timestamp: new Date().toISOString()
      };
      
      res.redirect('/teacher/confirm-test');
    } catch (error) {
      console.error('Error generating test:', error);
      res.status(500).send('An error occurred while generating the test. Please try again.');
    }
  });
  
  router.get('/confirm-test', (req, res) => {
    if (!req.session.generatedTest) {
      return res.redirect('/teacher/aitest');
    }
    
    res.render('confirmTest', {
      test: req.session.generatedTest
    });
  });
  
  router.post('/finalize-test', async (req, res) => {
    try {
      const { subject, topic, questions } = req.body;
      
      const processedQuestions = [];
      for (const id in questions) {
        processedQuestions.push({
          id: id,
          type: questions[id].type,
          question: questions[id].question,
          answer: questions[id].answer,
          marks: parseInt(questions[id].marks)
        });
      }
      
      const totalMarks = processedQuestions.reduce((sum, q) => sum + q.marks, 0);
      
      const test =new Test( {
        subject,
        topic,
        questions: processedQuestions,
        totalQuestions:processedQuestions.length,
        totalMarks,
        teacher:req.session.userId,
        code:generateCode(),
        status:"Inactive",
        createdAt: new Date()
      });

      
      await test.save();
      
      delete req.session.generatedTest;
      
      res.redirect('/teacher/dashboard');
    } catch (error) {
      console.error('Error finalizing test:', error);
      res.redirect('/teacher/aitest');
    }
  });


module.exports = router;
