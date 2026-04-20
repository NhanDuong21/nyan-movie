const User = require('../models/User');
const Movie = require('../models/Movie');
const Interaction = require('../models/Interaction');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalSingle,
            totalSeries,
            totalFavorites,
            latestMovies,
            topViewedSingle,
            topViewedSeries,
            topFavorited
        ] = await Promise.all([
            User.countDocuments(),
            Movie.countDocuments({ type: 'single' }),
            Movie.countDocuments({ type: 'series' }),
            Interaction.countDocuments({ type: 'favorite' }),
            Movie.find().sort({ createdAt: -1 }).limit(5).select('title views type createdAt'),
            Movie.find({ type: 'single' }).sort({ views: -1 }).limit(5).select('title views'),
            Movie.find({ type: 'series' }).sort({ views: -1 }).limit(5).select('title views'),
            Interaction.aggregate([
                { $match: { type: 'favorite' } },
                { $group: { _id: '$movie', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'movies',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'movieDetails'
                    }
                },
                { $unwind: '$movieDetails' },
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        title: '$movieDetails.title'
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    totalUsers,
                    totalSingle,
                    totalSeries,
                    totalFavorites
                },
                latestMovies,
                topViewedSingle,
                topViewedSeries,
                topFavorited
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent self-deletion or deleting the last admin
        if (userToDelete._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
        }

        if (userToDelete.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot delete the only remaining admin' });
            }
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'User removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
