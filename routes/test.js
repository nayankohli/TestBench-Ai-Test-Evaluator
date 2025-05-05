const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { requireAuthentication } = require('../middleware/auth');

router.use(requireAuthentication);

router.get("/:code", testController.getTestByCode);
router.post('/:code/submit', testController.submitTest);

module.exports = router;