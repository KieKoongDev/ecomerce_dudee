const router = require('express').Router();
const userLogController = require('../controllers/userLogController');
const { verifyToken } = require('../middlewares/verifyToken');

router.get('/', verifyToken, userLogController.getUserLogs);

module.exports = router