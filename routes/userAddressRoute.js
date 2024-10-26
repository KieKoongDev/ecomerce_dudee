const router = require('express').Router();
const userAddressController = require('../controllers/userAddressController');
const { verifyToken, verifyTokenUser } = require('../middlewares/verifyToken');

router.post('/',verifyTokenUser, userAddressController.createAddress);
router.put('/:id', verifyTokenUser, userAddressController.updateAddress);
router.get('/', verifyToken, userAddressController.getAddresses);
router.get('/:id', verifyToken, userAddressController.getAddressById);
router.delete('/:id', verifyTokenUser, userAddressController.deleteAddress);

module.exports = router