const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { auth } = require('../middleware/authMiddleware');

router.post('/add', auth, questionController.addQuestion);
router.post('/submit/:id', auth, questionController.submitAnswer);
router.get('/category/:categoryId', questionController.listQuestionsByCategory);
router.get('/search', auth, questionController.searchWithUserAnswers);


module.exports = router;
