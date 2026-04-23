const Movie = require('../models/Movie');
const Episode = require('../models/Episode');
const Genre = require('../models/Genre');
const Country = require('../models/Country');
const Year = require('../models/Year');
const Rating = require('../models/Rating');
const mongoose = require('mongoose');

exports.getMovies = async (req, res, next) => {
    try {
        const { search, type, genre, country, year, status, recent, select, sort, page, limit } = req.query;
        let filters = {};

        if (type && type !== 'all') {
            filters.type = type;
        }

        // Recent days rule (e.g., PHIM MỚI = 14 days)
        if (recent) {
            const days = parseInt(recent, 10);
            if (!isNaN(days)) {
                filters.updatedAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
            }
        }

        // Search Logic (Regex on title)
        if (search) {
            filters.title = { $regex: search, $options: 'i' };
        }

        // Category filtering by slug/value
        if (genre) {
            const genreDoc = await Genre.findOne({ slug: genre });
            if (genreDoc) filters.genres = genreDoc._id;
            else filters._id = null;
        }

        if (country) {
            const countryDoc = await Country.findOne({ slug: country });
            if (countryDoc) filters.country = countryDoc._id;
            else filters._id = null;
        }

        if (year) {
            const yearDoc = await Year.findOne({ year: parseInt(year) });
            if (yearDoc) filters.year = yearDoc._id;
            else filters._id = null;
        }

        if (status && status !== 'all' && status !== 'hidden') {
            filters.status = status;
        } else {
            // Strictly enforce $ne: 'hidden' for public endpoint, no admin bypass
            filters.status = { $ne: 'hidden' };
        }

        // Create query
        let query = Movie.find(filters).populate('genres country year');

        // Select Fields
        if (select) {
            const fields = select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            // Default to createdAt so "Latest Releases" aren't affected by view count updates
            query = query.sort('-createdAt');
        }

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const startIndex = (pageNum - 1) * limitNum;
        const total = await Movie.countDocuments(filters);

        query = query.skip(startIndex).limit(limitNum);

        const movies = await query;

        res.status(200).json({
            success: true,
            count: movies.length,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            },
            data: movies
        });
    } catch (error) {
        next(error);
    }
};

exports.getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id).populate('genres country year');

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        next(error);
    }
};

exports.getMovieBySlug = async (req, res, next) => {
    try {
        const movie = await Movie.findOne({ slug: req.params.slug }).populate('genres country year');

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        // If hidden, strictly block for everyone on public detail page
        if (movie.status === 'hidden') {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        // Find episodes
        const episodes = await Episode.find({ movie: movie._id }).sort('episodeNumber');

        res.status(200).json({
            success: true,
            data: {
                ...movie._doc,
                episodes
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAdminMovies = async (req, res, next) => {
    try {
        const { search, type, genre, country, year, status, select, sort, page, limit } = req.query;
        let filters = {};

        if (type && type !== 'all') {
            filters.type = type;
        }

        // Search Logic (Regex on title)
        if (search) {
            filters.title = { $regex: search, $options: 'i' };
        }

        if (genre) {
            const genreDoc = await Genre.findOne({ slug: genre });
            if (genreDoc) filters.genres = genreDoc._id;
            else filters._id = null;
        }

        if (country) {
            const countryDoc = await Country.findOne({ slug: country });
            if (countryDoc) filters.country = countryDoc._id;
            else filters._id = null;
        }

        if (year) {
            const yearDoc = await Year.findOne({ year: parseInt(year) });
            if (yearDoc) filters.year = yearDoc._id;
            else filters._id = null;
        }

        // Status filter mapping (Admin specific, allows 'hidden' etc.)
        if (status && status !== 'all') {
            filters.status = status;
        }

        // Create query
        let query = Movie.find(filters).populate('genres country year');

        // Select Fields
        if (select) {
            const fields = select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const startIndex = (pageNum - 1) * limitNum;
        const total = await Movie.countDocuments(filters);

        query = query.skip(startIndex).limit(limitNum);

        const movies = await query;

        res.status(200).json({
            success: true,
            count: movies.length,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            },
            data: movies
        });
    } catch (error) {
        next(error);
    }
};

exports.createMovie = async (req, res, next) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json({ success: true, data: movie });
    } catch (error) {
        next(error);
    }
};

exports.updateMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        next(error);
    }
};

exports.deleteMovie = async (req, res, next) => {
    try {
        // SOFT DELETE as per docs
        const movie = await Movie.findByIdAndUpdate(req.params.id, { status: 'hidden' }, { new: true });
        
        if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

        res.status(200).json({ success: true, message: 'Movie status set to hidden' });
    } catch (error) {
        next(error);
    }
};

// @desc    Increment views for movie and episode
// @route   POST /api/movies/:movieId/episodes/:episodeId/view
// @access  Public
exports.incrementView = async (req, res, next) => {
    try {
        const { movieId, episodeId } = req.params;

        await Promise.all([
            Movie.findByIdAndUpdate(movieId, { $inc: { views: 1 } }),
            Episode.findByIdAndUpdate(episodeId, { $inc: { views: 1 } })
        ]);

        res.status(200).json({ success: true, message: 'View incremented' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get content-based recommendations for a movie
// @route   GET /api/movies/:id/recommendations
// @access  Public
exports.getRecommendations = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch the source movie with its key attributes
        const source = await Movie.findById(id)
            .populate('genres', '_id')
            .populate('country', '_id')
            .lean();

        if (!source) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        const sourceGenreIds = (source.genres || []).map(g => g._id.toString());
        const sourceCountryId = source.country?._id?.toString();
        const sourceType = source.type;
        const sourceTags = source.tags || [];

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const HIGH_VIEWS_THRESHOLD = 500;

        // Fetch candidate movies (pre-filter to same-genre OR same-country for efficiency)
        const candidates = await Movie.find({
            _id: { $ne: id },
            status: { $ne: 'hidden' },
            $or: [
                { genres: { $in: source.genres.map(g => g._id) } },
                { country: source.country?._id }
            ]
        })
            .populate('genres', '_id name')
            .populate('country', '_id name')
            .populate('year', 'year')
            .select('title slug poster genres country type tags views ratingAverage ratingCount createdAt year')
            .lean();

        // Score each candidate
        const scored = candidates.map(candidate => {
            let score = 0;

            // +5: At least one overlapping genre
            const candidateGenreIds = (candidate.genres || []).map(g => g._id.toString());
            if (candidateGenreIds.some(id => sourceGenreIds.includes(id))) score += 5;

            // +4: At least one overlapping tag (safe — tags may be undefined)
            const candidateTags = candidate.tags || [];
            if (sourceTags.length > 0 && candidateTags.some(t => sourceTags.includes(t))) score += 4;

            // +3: Same country
            if (candidate.country?._id?.toString() === sourceCountryId) score += 3;

            // +3: Same type
            if (candidate.type === sourceType) score += 3;

            // +1: High views
            if ((candidate.views || 0) > HIGH_VIEWS_THRESHOLD) score += 1;

            // +1: High rating
            if ((candidate.ratingAverage || 0) >= 8.0) score += 1;

            // +1: New release (within the last 30 days)
            if (new Date(candidate.createdAt) >= thirtyDaysAgo) score += 1;

            return { ...candidate, score };
        });

        // Sort descending by score, take top 6
        const recommendations = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);

        res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
        next(error);
    }
};

// @desc    Rate a movie (1-10)
// @route   POST /api/movies/:id/rate
// @access  Private
exports.rateMovie = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { score } = req.body;

        // Validation
        if (!score || score < 1 || score > 10) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn điểm từ 1 đến 10.' });
        }

        // Rule Check: Admin/Root cannot rate
        if (req.user.role === 'admin' || req.user.is_root || req.user.email === 'sgoku4880@gmail.com') {
            return res.status(403).json({ success: false, message: 'Quản trị viên không thể đánh giá phim.' });
        }

        // Create or update existing rating
        await Rating.findOneAndUpdate(
            { user: req.user.id, movie: id },
            { score },
            { upsert: true, new: true }
        );

        // Recalculate average and count using aggregation
        const stats = await Rating.aggregate([
            { $match: { movie: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: '$movie',
                    ratingCount: { $sum: 1 },
                    ratingAverage: { $avg: '$score' }
                }
            }
        ]);

        const ratingCount = stats[0]?.ratingCount || 0;
        const ratingAverage = stats[0]?.ratingAverage || 0;

        // Update Movie document
        const updatedMovie = await Movie.findByIdAndUpdate(
            id,
            { ratingAverage, ratingCount },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: {
                ratingAverage: updatedMovie.ratingAverage,
                ratingCount: updatedMovie.ratingCount
            }
        });
    } catch (error) {
        next(error);
    }
};
