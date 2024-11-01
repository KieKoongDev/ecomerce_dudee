const UserLog = require('../models/UserLog');

exports.getUserLogs = async (req, res) => {
    const { user_id, action, role, page=1, limit=50 } = req.query
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    try {
        let query = {}
        if (user_id) {
            query.user_id = user_id
        }
        if (action) {
            query.action = action
        }
        if (role) {
            query.role = role
        }

        const userLogs = await UserLog
        .find(query)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);
        
        return res.status(200).json({ message: 'User logs retrieved successfully', status: 200, data: userLogs });
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}