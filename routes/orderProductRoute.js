const router = require('express').Router();
const orderProductController = require('../controllers/orderProductController');
const { verifyToken } = require('../middlewares/verifyToken');

router.get('/', verifyToken, orderProductController.getOrderProducts);

module.exports = router