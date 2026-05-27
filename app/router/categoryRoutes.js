const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/add',categoryController.addCategory)
router.get('/', categoryController.listCategoriesWithCount);

module.exports = router;
