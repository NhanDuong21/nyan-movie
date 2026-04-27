const News = require('../models/News');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getAllNews = async (req, res, next) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: news.length, data: news });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single news by slug
// @route   GET /api/news/:slug
// @access  Public
exports.getNewsBySlug = async (req, res, next) => {
    try {
        const news = await News.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { views: 1 } },
            { returnDocument: 'after' }
        );

        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }

        res.status(200).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = async (req, res, next) => {
    try {
        const news = await News.create(req.body);
        res.status(201).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = async (req, res, next) => {
    try {
        const news = await News.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }

        res.status(200).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = async (req, res, next) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }

        res.status(200).json({ success: true, message: 'News deleted' });
    } catch (error) {
        next(error);
    }
};
