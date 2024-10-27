const User = require('../models/User');
const UserLog = require('../models/UserLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: 404 });
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Wrong password', status: 400 });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SEC, { expiresIn: '1d' });

        const userLog = new UserLog({
            user_id: user._id,
            user_code: user.code,
            action: `Login`,
            detail: `${user.role} is logged in username ${user.username}`
        });
        await userLog.save();

        res.status(200).json({ token, status: 200 });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};

exports.getMe = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findById(id).select('-password -__v');
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: 404 });
        }

        res.status(200).json({ data: user, status: 200 });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};