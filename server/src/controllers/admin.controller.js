const User = require('../models/User');
const Movie = require('../models/Movie');
const Interaction = require('../models/Interaction');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const queryFilter = { status: { $ne: 'hidden' } };

        const [
            totalUsers,
            totalSingle,
            totalSeries,
            totalHoathinh,
            totalChieurap,
            totalFavorites,
            latestMovies,
            topViewedSingle,
            topViewedSeries,
            topFavorited
        ] = await Promise.all([
            User.countDocuments(),
            Movie.countDocuments({ type: 'single', ...queryFilter }),
            Movie.countDocuments({ type: 'series', ...queryFilter }),
            Movie.countDocuments({ type: 'hoathinh', ...queryFilter }),
            Movie.countDocuments({ type: 'chieurap', ...queryFilter }),
            Interaction.countDocuments({ type: 'favorite' }),
            Movie.find(queryFilter).sort({ createdAt: -1 }).limit(5).select('title views type createdAt'),
            Movie.find({ type: 'single', ...queryFilter }).sort({ views: -1 }).limit(5).select('title views'),
            Movie.find({ type: 'series', ...queryFilter }).sort({ views: -1 }).limit(5).select('title views'),
            Interaction.aggregate([
                { $match: { type: 'favorite' } },
                { $group: { _id: '$movie', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }, // Get more to account for potential hidden filters
                {
                    $lookup: {
                        from: 'movies',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'movieDetails'
                    }
                },
                { $unwind: '$movieDetails' },
                { $match: { 'movieDetails.status': { $ne: 'hidden' } } },
                { $limit: 5 },
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
                    totalHoathinh,
                    totalChieurap,
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

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists with this email or username' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const { username, email, role } = req.body;

        // Check if updating to an email/username that already exists (for other users)
        const duplicate = await User.findOne({
            $and: [
                { _id: { $ne: req.params.id } },
                { $or: [{ email }, { username }] }
            ]
        });

        if (duplicate) {
            return res.status(400).json({ success: false, message: 'Email or Username already taken' });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (targetUser.email === 'sgoku4880@gmail.com' || targetUser.is_root) {
            return res.status(403).json({ success: false, message: 'Lỗi: Không thể thao tác lên tài khoản Owner/Root.' });
        }

        // --- PEER-TO-PEER ADMIN PROTECTION ---
        const isRequesterRoot = req.user.email === 'sgoku4880@gmail.com' || req.user.is_root;
        if (targetUser.role === 'admin' && !isRequesterRoot) {
            return res.status(403).json({ success: false, message: 'Lỗi: Quản trị viên không thể thao tác lên một quản trị viên khác. Vui lòng liên hệ Owner/Root.' });
        }

        // --- PRIVILEGE ESCALATION PROTECTION ---
        if (role && role !== targetUser.role) {
            // Check if requester is Root
            const isRequesterRoot = req.user.email === 'sgoku4880@gmail.com' || req.user.is_root;
            if (!isRequesterRoot) {
                return res.status(403).json({ success: false, message: 'Lỗi: Chỉ tài khoản Root mới có quyền thay đổi chức vụ.' });
            }

            // Prevent self-demotion/self-modification of role
            if (req.params.id === req.user.id.toString()) {
                return res.status(403).json({ success: false, message: 'Lỗi: Không thể tự thay đổi chức vụ của chính mình.' });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user role (Deprecated - merged into updateUser)
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

// @desc    Toggle user active status (Ban/Unban)
// @route   PATCH /api/admin/users/:id/ban
// @access  Private/Admin
exports.toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Protection for Root Account
        if (user.email === 'sgoku4880@gmail.com' || user.is_root) {
            return res.status(403).json({ success: false, message: 'Lỗi: Không thể thao tác lên tài khoản Owner/Root.' });
        }

        // --- PEER-TO-PEER ADMIN PROTECTION ---
        const isRequesterRoot = req.user.email === 'sgoku4880@gmail.com' || req.user.is_root;
        if (user.role === 'admin' && !isRequesterRoot) {
            return res.status(403).json({ success: false, message: 'Lỗi: Quản trị viên không thể thao tác lên một quản trị viên khác. Vui lòng liên hệ Owner/Root.' });
        }

        // Prevent self-ban
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot ban yourself' });
        }

        user.isActive = !user.isActive;
        await user.save();

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

        // Protection for Root Account
        if (userToDelete.email === 'sgoku4880@gmail.com' || userToDelete.is_root) {
            return res.status(403).json({ success: false, message: 'Lỗi: Không thể thao tác lên tài khoản Owner/Root.' });
        }

        // --- PEER-TO-PEER ADMIN PROTECTION ---
        const isRequesterRoot = req.user.email === 'sgoku4880@gmail.com' || req.user.is_root;
        if (userToDelete.role === 'admin' && !isRequesterRoot) {
            return res.status(403).json({ success: false, message: 'Lỗi: Quản trị viên không thể thao tác lên một quản trị viên khác. Vui lòng liên hệ Owner/Root.' });
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
