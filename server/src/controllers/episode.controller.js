const Episode = require('../models/Episode');
const Movie = require('../models/Movie');

exports.getEpisodes = async (req, res, next) => {
    try {
        const { movieId } = req.query;
        if (!movieId) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp movieId' });
        }

        const episodes = await Episode.find({ movie: movieId }).sort('episodeNumber');
        res.status(200).json({ success: true, count: episodes.length, data: episodes });
    } catch (error) {
        next(error);
    }
};

exports.addEpisode = async (req, res, next) => {
    try {
        req.body.movie = req.params.movieId;

        // Check if movie exists
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

        // Enforce business logic: Single movies (Phim lẻ) can only have max 1 episode
        if (movie.type === 'single') {
            const episodeCount = await Episode.countDocuments({ movie: req.params.movieId });
            if (episodeCount >= 1) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Lỗi: Phim lẻ chỉ được phép có tối đa 1 tập.' 
                });
            }
        }

        const episode = await Episode.create(req.body);

        // Update parent movie's timestamp so it moves to top of "Latest" lists
        await Movie.findByIdAndUpdate(req.params.movieId, { updatedAt: Date.now() });

        res.status(201).json({ success: true, data: episode });
    } catch (error) {
        next(error);
    }
};

exports.updateEpisode = async (req, res, next) => {
    try {
        const episode = await Episode.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!episode) return res.status(404).json({ success: false, message: 'Episode not found' });

        res.status(200).json({ success: true, data: episode });
    } catch (error) {
        next(error);
    }
};

exports.deleteEpisode = async (req, res, next) => {
    try {
        const episode = await Episode.findByIdAndDelete(req.params.id);
        if (!episode) return res.status(404).json({ success: false, message: 'Episode not found' });
        res.status(200).json({ success: true, message: 'Episode deleted' });
    } catch (error) {
        next(error);
    }
};
