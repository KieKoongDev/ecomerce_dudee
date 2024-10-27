const OrderProduct = require('../models/OrderProduct');

exports.getOrderProducts = async (req, res) => {
    const { order_id, page=1, limit=50 } = req.query
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    try {
        let query = {}
        if (order_id) {
            query.order_id = order_id
        }

        const ordeProducts = await OrderProduct
        .find(query)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);
        
        return res.status(200).json({ message: 'Order products retrieved successfully', status: 200, data: ordeProducts });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}