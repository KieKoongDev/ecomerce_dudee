const User = require('../models/User');
const UserLog = require('../models/UserLog');
const UserAddress = require('../models/UserAddress');
const bcrypt = require('bcrypt');

const generateUserCode = async (role) => {
    if (role === 'admin') {
        const admins = await User.find({ role: 'admin' });
        const adminAmount = admins.length
        code = `ADMIN-${(adminAmount + 1).toString().padStart(4, '0')}`
    } else {
        const users = await User.find()
        const userAmount = users.length
        code = `USER-${(userAmount + 1).toString().padStart(4, '0')}`
    }
    return code;
}

exports.createUser = async (req, res) => {
    const {
        username,
        name,
        password,
        role
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
        } else if (username.some(char => ['@','$','!','%','*','?','&', ' '].includes(char))) {
            return res.status(400).json({ message: 'username must not contain special characters or space', status: 400 });
        }

        // validate name
        if (name.length < 4 || name.length > 20) {
            return res.status(400).json({ message: 'name must be between 4 and 20 characters', status: 400 });
        } else if (name.some(char => ['@','$','!','%','*','?','&', ' '].includes(char))) {
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
            action: `UpdateUser`,
            detail: `Change ${user.role} name from ${old_name} to ${name}`
        });
        await userLog.save();

        return res.status(201).json({ message: 'User created successfully', status: 201 });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}