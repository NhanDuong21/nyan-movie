const Interaction = require('../models/Interaction');

// @desc    Toggle movie in favorites
// @route   POST /api/interactions/favorite
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
    try {
        const { movieId } = req.body;
        
        let favorite = await Interaction.findOne({
            user: req.user.id,
            movie: movieId,
            type: 'favorite'
        });

        if (favorite) {
            await favorite.deleteOne();
            return res.status(200).json({ success: true, isFavorite: false, message: 'Removed from favorites' });
        }

        favorite = await Interaction.create({
            user: req.user.id,
            movie: movieId,
            type: 'favorite'
        });

        res.status(201).json({ success: true, isFavorite: true, data: favorite });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user favorites
// @route   GET /api/interactions/favorite
// @access  Private
exports.getFavorites = async (req, res, next) => {
    try {
        const favorites = await Interaction.find({
            user: req.user.id,
            type: 'favorite'
        }).populate('movie');

        res.status(200).json({
            success: true,
            count: favorites.length,
            data: favorites.map(f => f.movie)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add or update movie in watch history
// @route   POST /api/interactions/history
// @access  Private
exports.addToHistory = async (req, res, next) => {
    try {
        const { movieId, episodeId } = req.body;

        // Upsert history interaction
        const history = await Interaction.findOneAndUpdate(
            { user: req.user.id, movie: movieId, type: 'history' },
            { episode: episodeId, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user watch history
// @route   GET /api/interactions/history
// @access  Private
exports.getHistory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const totalItems = await Interaction.countDocuments({
            user: req.user.id,
            type: 'history'
        });

        const history = await Interaction.find({
            user: req.user.id,
            type: 'history'
        })
        .populate('movie')
        .populate('episode')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalItems,
            hasMore: totalItems > skip + history.length,
            count: history.length,
            data: history
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Check if a movie is favorited
// @route   GET /api/interactions/favorite/check/:movieId
// @access  Private
exports.checkFavorite = async (req, res, next) => {
    try {
        const favorite = await Interaction.findOne({
            user: req.user.id,
            movie: req.params.movieId,
            type: 'favorite'
        });

        res.status(200).json({ success: true, isFavorite: !!favorite });
    } catch (error) {
        next(error);
    }
};
