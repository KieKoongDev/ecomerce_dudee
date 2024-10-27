const OrderLog = require('../models/OrderLog');

exports.getOrderLogs = async (req, res) => {
    const { user_id, action, order_id, page=1, limit=50 } = req.query
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    try {
        let query = {}
        if (user_id) {
            query.by = user_id
        }
        if (action) {
            query.action = action
        }
        if (order_id) {
            query.order_id = order_id
        }

        const orderLogs = await OrderLog
        .find(query)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);
        
        return res.status(200).json({ message: 'Order logs retrieved successfully', status: 200, data: orderLogs });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}