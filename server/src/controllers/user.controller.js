const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { username, avatar } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (username) user.username = username;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        // Check for duplicate username
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'username already exists' });
        }
        next(error);
    }
};
