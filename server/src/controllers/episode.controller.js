const Episode = require('../models/Episode');
const Movie = require('../models/Movie');

exports.getEpisodes = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, movieId } = req.query;
        const targetMovieId = req.params.id || movieId;

        if (!targetMovieId) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp movieId' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const episodes = await Episode.find({ movie: targetMovieId })
            .sort('episodeNumber')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Episode.countDocuments({ movie: targetMovieId });

        res.status(200).json({ 
            success: true, 
            data: episodes,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching episodes:', error);
        next(error);
    }
};

exports.addEpisode = async (req, res, next) => {
    try {
        const { movieId } = req.params;

        // Validation: Prevent CastError if movieId is "undefined" or missing
        if (!movieId || movieId === 'undefined' || !movieId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID phim không hợp lệ hoặc bị thiếu.' 
            });
        }

        req.body.movie = movieId;

        // Check if movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

        // Enforce business logic: Single movies (Phim lẻ) & Cinema movies (Phim chiếu rạp) can only have max 1 episode
        if (movie.type === 'single' || movie.type === 'chieurap') {
            const episodeCount = await Episode.countDocuments({ movie: req.params.movieId });
            if (episodeCount >= 1) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Lỗi: ${movie.type === 'single' ? 'Phim lẻ' : 'Phim chiếu rạp'} chỉ được phép có tối đa 1 tập.` 
                });
            }
        }

        const episode = await Episode.create(req.body);

        // Update parent movie's timestamp so it moves to top of "Latest" lists
        await Movie.findByIdAndUpdate(req.params.movieId, { updatedAt: Date.now() });

        res.status(201).json({ success: true, data: episode });
    } catch (error) {
        console.error('Error adding episode:', error);
        next(error);
    }
};

exports.updateEpisode = async (req, res, next) => {
    try {
        const episode = await Episode.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!episode) return res.status(404).json({ success: false, message: 'Episode not found' });

        res.status(200).json({ success: true, data: episode });
    } catch (error) {
        console.error('Error updating episode:', error);
        next(error);
    }
};

exports.deleteEpisode = async (req, res, next) => {
    try {
        const episode = await Episode.findByIdAndDelete(req.params.id);
        if (!episode) return res.status(404).json({ success: false, message: 'Episode not found' });
        res.status(200).json({ success: true, message: 'Episode deleted' });
    } catch (error) {
        console.error('Error deleting episode:', error);
        next(error);
    }
};

exports.bulkAddEpisodes = async (req, res, next) => {
    try {
        const { movieId } = req.params;
        const { episodes } = req.body;

        if (!episodes || !Array.isArray(episodes) || episodes.length === 0) {
            return res.status(400).json({ success: false, message: 'Danh sách tập phim không hợp lệ.' });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ success: false, message: 'Phim không tồn tại' });

        // Enforce business logic for single/cinema movies
        if (movie.type === 'single' || movie.type === 'chieurap') {
            const currentCount = await Episode.countDocuments({ movie: movieId });
            if (currentCount + episodes.length > 1) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Lỗi: ${movie.type === 'single' ? 'Phim lẻ' : 'Phim chiếu rạp'} chỉ được phép có tối đa 1 tập.` 
                });
            }
        }

        const preparedEpisodes = episodes.map((ep) => ({
            ...ep,
            movie: movieId,
            videoUrl: ep.videoUrl || ep.link_phim // Handle both names for flexibility
        }));

        await Episode.insertMany(preparedEpisodes);

        // Update movie timestamp
        await Movie.findByIdAndUpdate(movieId, { updatedAt: Date.now() });

        res.status(201).json({ 
            success: true, 
            message: `Đã thêm thành công ${preparedEpisodes.length} tập phim.` 
        });
    } catch (error) {
        console.error('Error in bulkAddEpisodes:', error);
        next(error);
    }
};
