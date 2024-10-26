const UserAddress = require('../models/UserAddress');

exports.createAddress = async (req, res) => {
    const { user_id, address, title, phone, receiver_name } = req.body;
    try {
        
        if (!user_id || !address || !title || !phone || !receiver_name) {
            return res.status(400).json({ message: 'user_id, address, title, phone, receiver_name are required', status: 400 });
        }

        const countAddress = await UserAddress.countDocuments({ user_id: user_id });
        if (countAddress >= 3) {
            return res.status(400).json({ message: 'User already has max address', status: 400 });
        }

        const userAddress = new UserAddress({ user_id, address, title, phone, receiver_name });
        await userAddress.save();
        return res.status(201).json({ message: 'Address created successfully', status: 201 });
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.updateAddress = async (req, res) => {
    const { address, title, phone, receiver_name } = req.body;
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: 'id is required', status: 400 });
        }

        const userAddress = await UserAddress.findById(id);
        if (!userAddress) {
            return res.status(404).json({ message: 'Address not found', status: 404 });
        }

        userAddress.address = address || userAddress.address;
        userAddress.title = title || userAddress.title;
        userAddress.phone = phone || userAddress.phone;
        userAddress.receiver_name = receiver_name || userAddress.receiver_name;

        await userAddress.save();
        return res.status(201).json({ message: 'Address updated successfully', status: 201 });
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.deleteAddress = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: 'id is required', status: 400 });
        }

        const userAddress = await UserAddress.findByIdAndDelete(id);
        if (!userAddress) {
            return res.status(404).json({ message: 'Address not found', status: 404 });
        }

        return res.status(200).json({ message: 'Address deleted successfully', status: 200 });
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.getAddressById = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: 'id is required', status: 400 });
        }

        const userAddress = await UserAddress.findById(id).select('-__v -createdAt -updatedAt -user_id');
        if (!userAddress) {
            return res.status(404).json({ message: 'Address not found', status: 404 });
        }

        return res.status(200).json({ data: userAddress, status: 200 });
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.getAddresses = async (req, res) => {
    const { user_id, page = 1, limit = 50 } = req.query
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    const { role, id } = req.user
    try {
        let query = {};

        if (role === 'admin') {
            if (user_id) {
                query.user_id = user_id;
            }
        } else {
            query.user_id = id;
        }

        const userAddresses = await UserAddress.find(query).skip((options.page - 1) * options.limit).limit(options.limit).select('-__v');

        return res.status(200).json({ data: userAddresses, status: 200 });
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}