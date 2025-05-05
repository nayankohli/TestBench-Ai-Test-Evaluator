const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { requireAuthentication, requireTeacherRole } = require('../middleware/auth');

router.use(requireAuthentication, requireTeacherRole);

router.get('/dashboard', teacherController.getDashboard);

router.get('/createTest', teacherController.getCreateTestPage);
router.post('/createTest', teacherController.createTest);

router.post('/activate/:code', teacherController.activateTest);
router.post('/inactive/:code', teacherController.deactivateTest);
router.get('/scores/:code', teacherController.getTestScores);
router.get('/edit/:code', teacherController.getEditTestPage);
router.post('/edit/:code', teacherController.updateTest);
router.delete('/delete/:code', teacherController.deleteTest);

router.get('/aitest', teacherController.getAiTestPage);
router.post('/aitest', teacherController.generateAiTest);
router.get('/confirm-test', teacherController.getConfirmTestPage);
router.post('/finalize-test', teacherController.finalizeTest);

module.exports = router;