const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireAuthentication, requireStudentRole } = require('../middleware/auth');

router.use(requireAuthentication, requireStudentRole);
router.get("/dashboard", studentController.getDashboard);
router.get("/scores", studentController.getScores);
router.get("/api/submission/:id", studentController.getSubmissionDetails);

module.exports = router;