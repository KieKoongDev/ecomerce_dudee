const router = require('express').Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/verifyToken');

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);

module.exports = router