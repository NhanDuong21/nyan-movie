const Episode = require('../models/Episode');
const Movie = require('../models/Movie');

exports.addEpisode = async (req, res, next) => {
    try {
        req.body.movie = req.params.movieId;

        // Check if movie exists
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

        const episode = await Episode.create(req.body);
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
