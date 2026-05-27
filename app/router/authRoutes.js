const express = require('express');
const authController = require('../controllers/authController');
const UserImage = require('../helper/UserImg');
const { auth } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup',UserImage.single('profilePic'),authController.signup );
router.post('/verify',authController.verify)
router.post('/login', authController.login);

router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth,UserImage.single('profilePic'), authController.editProfile);


module.exports = router;
