const router = require('express').Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyTokenAdmin } = require('../middlewares/verifyToken');

router.post('/', verifyTokenAdmin, productController.createProduct);
router.put('/:id', verifyTokenAdmin, productController.updateProduct);
router.get('/', verifyToken, productController.getProducts);
router.get('/:id', verifyToken, productController.getProductById);
router.delete('/:id', verifyTokenAdmin, productController.deleteProduct);

module.exports = router