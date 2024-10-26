const router = require('express').Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/verifyToken');

router.post('/', userController.createUser);
router.put('/:id', verifyToken, userController.updateUser);
router.put('/:id/change-password', verifyToken, userController.updateUserPassword);

module.exports = router