const Comment = require('../models/Comment');

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

        // Check ownership or admin
        if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
        }

        // If deleting a parent comment, also delete all replies
        if (!comment.parentId) {
            await Comment.deleteMany({ parentId: comment._id });
        }

        await comment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Comment removed'
        });
    } catch (error) {
        next(error);
    }
};
