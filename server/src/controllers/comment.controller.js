const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Get all comments for a movie
// @route   GET /api/comments/movie/:movieId
// @access  Public
exports.getMovieComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ movie: req.params.movieId })
            .populate({
                path: 'user',
                select: 'username avatar'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a comment
// @route   POST /api/comments
// @access  Private
exports.addComment = async (req, res, next) => {
    try {
        const { movieId, content, parentId } = req.body;

        // If parentId exists, verify it exists and belongs to the same movie
        if (parentId) {
            const parent = await Comment.findById(parentId);
            if (!parent || parent.movie.toString() !== movieId) {
                return res.status(400).json({ success: false, message: 'Invalid parent comment' });
            }
        }

        const comment = await Comment.create({
            content,
            movie: movieId,
            user: req.user.id,
            parentId: parentId || null
        });

        // Populate user info before sending back
        const populatedComment = await comment.populate({
            path: 'user',
            select: 'username avatar'
        });

        // Emit real-time event to the movie room
        if (global.io) {
            global.io.to(`movie_${movieId}`).emit('new_comment', populatedComment);
        }

        res.status(201).json({
            success: true,
            data: populatedComment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        const isRequesterRoot = req.user.is_root || req.user.email === 'sgoku4880@gmail.com';

        // Rule 1: Root can delete ANY comment
        if (isRequesterRoot) {
            // Allowed — proceed
        }
        // Rule 2: Check if user owns the comment
        else if (comment.user.toString() === requesterId) {
            // Allowed — user deleting their own comment
        }
        // Rule 3: Admin can delete USER comments, but NOT other ADMIN comments
        else if (requesterRole === 'admin') {
            // Fetch the comment owner to check their role
            const commentOwner = await User.findById(comment.user).select('role');
            if (commentOwner && commentOwner.role === 'admin') {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Admin không có quyền xóa bình luận của Admin khác. Chỉ Root mới có quyền này.' 
                });
            }
            // Allowed — admin deleting a user's comment
        }
        // Rule 4: Regular user trying to delete someone else's comment
        else {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn không có quyền xóa bình luận này.' 
            });
        }

        const movieId = comment.movie.toString();

        // If deleting a parent comment, also delete all replies
        if (!comment.parentId) {
            await Comment.deleteMany({ parentId: comment._id });
        }

        await comment.deleteOne();

        // Emit real-time event to the movie room
        if (global.io) {
            global.io.to(`movie_${movieId}`).emit('comment_deleted', { 
                commentId: comment._id,
                parentId: comment.parentId 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Comment removed'
        });
    } catch (error) {
        next(error);
    }
};
