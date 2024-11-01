const Order = require('../models/Order');
const OrderLog = require('../models/OrderLog');
const OrderProduct = require('../models/OrderProduct');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const generateOrderCode = async () => {
    const orders = await Order.find();
    const sameDateOrders = orders.filter(order => getYearMount(order.createdAt) === getYearMount());
    const code = `ORDER-${getYearMount()}${(sameDateOrders.length + 1).toString().padStart(3, '0')}`;
    return code;
}

const getYearMount = (dateInput) => {
    const date = dateInput ? new Date(dateInput) : new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const dateString = `${year}${month}`;
    return dateString;
}

const getFullYearMount = (dateInput) => {
    const date = dateInput ? new Date(dateInput) : new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const dateString = `${year}${month}`;
    return dateString;
}

exports.createOrder = async (req, res) => {
    const {
        user_id,
        product_items,
        delivery_method,
        delivery_price,
        user_address_id,
        payment_method
    } = req.body
    try {
        if (!user_id || !delivery_method || !delivery_price || !user_address_id) {
            return res.status(400).json({ message: 'user_id, delivery_method, delivery_price, user_address_id are required', status: 400 });
        }
        if (!product_items || product_items.length === 0) {
            return res.status(400).json({ message: 'products are required', status: 400 });
        }
        if (product_items.some(item => !item.product_id || !item.quantity || !item.ppu)) {
            return res.status(400).json({ message: 'product_id, quantity, ppu are required', status: 400 });
        }

        const code = await generateOrderCode();
        const total_product_price = product_items.reduce((total, item) => total + (item.ppu*item.quantity), 0);
        const net_price = total_product_price + (delivery_price || 0);

        const order = new Order({
            code,
            user_id,
            total_product_price,
            delivery_method,
            delivery_price,
            net_price,
            user_address_id,
            payment_method,
            year_mount: getFullYearMount()
        });
        const savedOrder = await order.save();

        const orderLog = new OrderLog({
            order_id: savedOrder._id,
            order_code: savedOrder.code,
            action: 'Create',
            by: req.user.id,
            description: 'Order created',
        });
        await orderLog.save();

        const orderProducts = await Promise.all(product_items.map(async item => {
            const orderProduct = new OrderProduct({
                order_id: savedOrder._id,
                product_id: item.product_id,
                quantity: item.quantity,
                ppu: item.ppu,
                total_price: item.ppu*item.quantity
            });
            await orderProduct.save();
        }))

        await Promise.all(product_items.map(async item => {
            const product = await Product.findById(item.product_id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found', status: 404 });
            }
            product.stock = product.stock - item.quantity;
            await product.save();
        }))
        
        return res.status(201).json({ message: 'Order created successfully', status: 201, data: savedOrder, product_items: orderProducts.length });

    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.updateOrder = async (req, res) => {
    const {
        product_items,
        delivery_method,
        delivery_price,
        user_address_id
    } = req.body
    const { id } = req.params
    try {

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found', status: 404 });
        }

        if (product_items && product_items.length === 0) {
            return res.status(400).json({ message: 'products length are required', status: 400 });
        }
        if (product_items && product_items.some(item => !item.product_id || !item.quantity || !item.ppu)) {
            return res.status(400).json({ message: 'product_id, quantity, ppu are required', status: 400 });
        }

        let total_product_price = null
        let net_price = null
        if (
            order.status === 1 
            && product_items 
            && product_items.length 
            && product_items.every(item => item.product_id && item.quantity && item.ppu)
        ) {
            total_product_price = product_items.reduce((total, item) => total + (item.ppu*item.quantity), 0);
            net_price = total_product_price + (delivery_price || 0);
        } 
        
        order.total_product_price = total_product_price || order.total_product_price
        order.delivery_method = delivery_method || order.delivery_method
        order.delivery_price = delivery_price || order.delivery_price
        order.net_price = net_price || order.net_price
        order.user_address_id = user_address_id || order.user_address_id

        const savedOrder = await order.save();

        const orderLog = new OrderLog({
            order_id: savedOrder._id,
            order_code: savedOrder.code,
            by: req.user.id,
            action: 'Edit',
            description: 'Order edited',
        });
        await orderLog.save();

        let orderProducts = await OrderProduct.find({ order_id: savedOrder._id });
        if (
            order.status === 1 
            && product_items 
            && product_items.length 
            && product_items.every(item => item.product_id && item.quantity && item.ppu)
        ) {
            await OrderProduct.deleteMany({ order_id: savedOrder._id });
            orderProducts = await Promise.all(product_items.map(async item => {
                const orderProduct = new OrderProduct({
                    order_id: savedOrder._id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    ppu: item.ppu,
                    total_price: item.ppu*item.quantity
                });
                await orderProduct.save();
            }))
        }
        
        return res.status(200).json({ message: 'Order updated successfully', status: 200 });

    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.updateOrderStatus = async (req, res) => {
    const { status, payment_method, payment_status, tracking_number } = req.body
    const { id } = req.params
    try {

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found', status: 404 });
        }

        const old_status = order.status
        const old_payment_status = order.payment_status

        order.status = status || old_status
        order.payment_method = payment_method || order.payment_method
        order.payment_status = payment_status || old_payment_status
        order.tracking_number = tracking_number || order.tracking_number
        const savedOrder = await order.save();

        if (status) {
            const orderLog = new OrderLog({
                order_id: savedOrder._id,
                by: req.user.id,
                order_code: savedOrder.code,
                action: 'Update Status',
                description: `Order status updated from ${old_status} to ${status}`,
            });
            await orderLog.save();
        }
        if (payment_method) {
            const orderLog = new OrderLog({
                order_id: savedOrder._id,
                order_code: savedOrder.code,
                by: req.user.id,
                action: 'Update Payment method',
                description: `Order payment method updated`,
            });
            await orderLog.save();
        }
        if (payment_status) {
            const orderLog = new OrderLog({
                order_id: savedOrder._id,
                order_code: savedOrder.code,
                by: req.user.id,
                action: 'Update Payment status',
                description: `Order payment status updated from ${old_payment_status} to ${payment_status}`,
            });
            await orderLog.save();
        }
        if (tracking_number) {
            const orderLog = new OrderLog({
                order_id: savedOrder._id,
                order_code: savedOrder.code,
                action: 'Update Tracking number',
                by: req.user.id,
                description: `Order tracking number updated`,
            });
            await orderLog.save();
        }
        
        return res.status(200).json({ message: 'Order updated successfully', status: 200 });

    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.getOrders = async (req, res) => {
    const { user_id, page = 1, limit = 50, status, year_mount } = req.query;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };

    try {
        let matchStage = {};
        if (user_id) {
            matchStage.user_id = new mongoose.Types.ObjectId(String(user_id));
        }
        if (status) {
            matchStage.status = Number(status);
        }
        if (year_mount) {
            matchStage.year_mount = String(year_mount);
        }

        const orders = await Order.aggregate([
            { $match: matchStage },
            { $skip: (options.page - 1) * options.limit },
            { $limit: options.limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_info',
                },
            },
            { $unwind: '$user_info' },
            {
                $lookup: {
                    from: 'useraddresses',
                    localField: 'user_address_id',
                    foreignField: '_id',
                    as: 'user_address_info',
                },
            },
            { $unwind: '$user_address_info' },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    user_id: 1,
                    'user_info.name': 1,
                    'user_info.code': 1,
                    createdAt: 1,
                    user_address_id: 1,
                    total_product_price: 1,
                    net_price: 1,
                    delivery_method: 1,
                    delivery_price: 1,
                    tracking_number: 1,
                    payment_method: 1,
                    payment_status: 1,
                    year_mount: 1,
                    'user_address_info.address': 1,
                    'user_address_info.receiver_name': 1,
                    'user_address_info.phone': 1,
                }
            }
        ]);

        return res.status(200).json({
            message: 'Orders fetched successfully',
            status: 200,
            data: orders,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};

exports.getOrder = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: 'id is required', status: 400 });
        }
        
        const [order] = await Order.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(String(id)) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_info',
                },
            },
            { $unwind: '$user_info' },
            {
                $lookup: {
                    from: 'useraddresses',
                    localField: 'user_address_id',
                    foreignField: '_id',
                    as: 'user_address_info',
                },
            },
            { $unwind: '$user_address_info' },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    user_id: 1,
                    'user_info.name': 1,
                    'user_info.code': 1,
                    createdAt: 1,
                    user_address_id: 1,
                    total_product_price: 1,
                    net_price: 1,
                    delivery_method: 1,
                    delivery_price: 1,
                    tracking_number: 1,
                    payment_method: 1,
                    payment_status: 1,
                    year_mount: 1,
                    'user_address_info.address': 1,
                    'user_address_info.receiver_name': 1,
                    'user_address_info.phone': 1,
                }
            }
        ]);

        if (!order) {
            return res.status(404).json({ message: 'Order not found', status: 404 });
        }
        
        return res.status(200).json({ message: 'Order fetched successfully', status: 200, data: order });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.deleteOrder = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: 'id is required', status: 400 });
        }
        
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found', status: 404 });
        }
        if (order.status !== 1) {
            return res.status(400).json({ message: 'Order cannot be delete on this state', status: 400 });
        }

        await Order.findByIdAndDelete(id);

        const orderLog = new OrderLog({
            order_id: order._id,
            order_code: order.code,
            action: 'Delete',
            by: req.user.id,
            description: `Order deleted`,
        });
        await orderLog.save();

        await OrderProduct.deleteMany({ order_id: id });
        
        return res.status(200).json({ message: 'Order deleted successfully', status: 200 });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}