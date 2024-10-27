const User = require('../models/User');
const UserLog = require('../models/UserLog');
const UserAddress = require('../models/UserAddress');
const bcrypt = require('bcrypt');

const generateUserCode = async (role) => {
    if (role === 'admin') {
        const adminAmount = await User.countDocuments({ role: 'admin' });
        code = `ADMIN-${(adminAmount + 1).toString().padStart(4, '0')}`;
    } else {
        const userAmount = await User.countDocuments({ role: 'user' });
        code = `USER-${(userAmount + 1).toString().padStart(4, '0')}`;
    }
    return code;
}

const getUserAddress = async (user_id) => {
    const address = await UserAddress.find({ user_id: user_id }).select('-__v -createdAt -updatedAt -user_id');
    return address;
}

exports.createUser = async (req, res) => {
    const {
        username,
        name,
        password,
        role = 'user'
    } = req.body
    try {
        // validate request parameters
        if (!username || !name || !password || !role) {
            return res.status(400).json({ message: 'username password role and name are required', status: 400 });
        }

        // check duplicate username
        const existUser = await User.findOne({ username });
        if (existUser) {
            return res.status(409).json({ message: 'username or email already exists', status: 409 });
        }

        // validate username
        if (username.length < 4 || username.length > 20) {
            return res.status(400).json({ message: 'username must be between 4 and 20 characters', status: 400 });
        } else if (Array.from(username).some(char => ['@','$','!','%','*','?','&', ' '].includes(char))) {
            return res.status(400).json({ message: 'username must not contain special characters or space', status: 400 });
        }

        // validate name
        if (name.length < 4 || name.length > 20) {
            return res.status(400).json({ message: 'name must be between 4 and 20 characters', status: 400 });
        } else if (Array.from(name).some(char => ['@','$','!','%','*','?','&', ' '].includes(char))) {
            return res.status(400).json({ message: 'name must not contain special characters or space', status: 400 });
        }

        // validate password
        if (password.length < 6 || password.length > 20) {
            return res.status(400).json({ message: 'password must be between 6 and 20 characters', status: 400 });
        }

        const code = await generateUserCode(role)
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            code,
            username,
            name,
            password: hashedPassword,
            role
        });
        await user.save();

        const userLog = new UserLog({
            user_id: user._id,
            action: `CreateUser`,
            detail: `Created ${user.role} : ${user.code}`
        });
        await userLog.save();

        return res.status(201).json({ message: 'User created successfully', status: 201 });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.updateUser = async (req, res) => {
    const { name } = req.body
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Forbidden', status: 403 });
        }
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Forbidden', status: 403 });
        }

        // validate request parameter
        if (!name) {
            return res.status(400).json({ message: 'name is required', status: 400 });
        }

        // validate name
        if (name.length < 4 || name.length > 20) {
            return res.status(400).json({ message: 'name must be between 4 and 20 characters', status: 400 });
        } else if (name.some(char => ['@','$','!','%','*','?','&', ' '].includes(char))) {
            return res.status(400).json({ message: 'name must not contain special characters or space', status: 400 });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: 404 });
        }

        const old_name = user.name
        user.name = name;

        await user.save();

        const userLog = new UserLog({
            user_id: id,
            user_code: user.code,
            action: `UpdateUser`,
            detail: `Change ${user.role} name from ${old_name} to ${name}`
        });
        await userLog.save();

        return res.status(201).json({ message: 'User updated successfully', status: 201 });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.updateUserPassword = async (req, res) => {
    const { old_password, new_password } = req.body
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Forbidden', status: 403 });
        }
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Forbidden', status: 403 });
        }
        
        // validate request parameter
        if (!old_password || !new_password) {
            return res.status(400).json({ message: 'old_password and new_password are required', status: 400 });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: 404 });
        }

        if (!await bcrypt.compare(old_password, user.password)) {
            return res.status(400).json({ message: 'Wrong password', status: 400 });
        }

        // validate new password
        if (new_password.length < 6 || new_password.length > 20) {
            return res.status(400).json({ message: 'password must be between 6 and 20 characters', status: 400 });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        user.password = hashedPassword;
        await user.save();

        const userLog = new UserLog({
            user_id: req.params.id,
            user_code: user.code,
            action: `ChangePassword`,
            detail: `Change ${user.role} password`
        });
        await userLog.save();

        return res.status(201).json({ message: 'User updated user password successfully', status: 201 });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.getUsers = async (req, res) => {
    const { name, role, page=1, limit=50 } = req.query
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    try {
        let query = {}
        if (name) {
            query.name = { $regex: name, $options: 'i' }
        }
        if (role) {
            query.role = role
        }

        const users = await User
        .find(query)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);
        
        return res.status(200).json({ message: 'Users retrieved successfully', status: 200, data: users });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.getUser = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: 'id is required', status: 400 });
        }

        const user = await User.findById(id).select('-password -__v');

        if (!user) {
            return res.status(404).json({ message: 'User not found', status: 404 });
        }

        const userAddress = await getUserAddress(user._id);

        const formattedUser = {
            ...user._doc,
            address: userAddress
        }

        return res.status(200).json({ message: 'User retrieved successfully', status: 200, data: formattedUser });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}

exports.deleteUser = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: 'id is required', status: 400 });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: 404 });
        }
        
        await User.deleteOne({ _id: id });

        const userLog = new UserLog({
            user_id: id,
            user_code: user.code,
            action: `DeleteUser`,
            detail: `Delete ${user.role} account username ${user.username}`
        });
        await userLog.save();

        return res.status(200).json({ message: 'User retrieved successfully', status: 200, data: formattedUser });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}