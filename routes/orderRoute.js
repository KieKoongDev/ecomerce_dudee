const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/verifyToken');

router.post('/',verifyToken, orderController.createOrder);
router.put('/:id', verifyToken, orderController.updateOrder);
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);
router.get('/', verifyToken, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrder);
router.delete('/:id', verifyToken, orderController.deleteOrder);

module.exports = router