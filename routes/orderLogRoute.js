const router = require('express').Router();
const orderLogController = require('../controllers/orderLogController');
const { verifyToken } = require('../middlewares/verifyToken');

router.get('/', verifyToken, orderLogController.getOrderLogs);

module.exports = router