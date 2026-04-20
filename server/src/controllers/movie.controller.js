const Movie = require('../models/Movie');
const Episode = require('../models/Episode');

exports.getMovies = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Support for hidden status filtering (Admin can see hidden, users can't)
        if (!req.user || req.user.role !== 'admin') {
            reqQuery.status = { $ne: 'hidden' };
        }

        // Create query string
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Movie.find(JSON.parse(queryStr)).populate('genres country year');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const total = await Movie.countDocuments(JSON.parse(queryStr));

        query = query.skip(startIndex).limit(limit);

        const movies = await query;

        res.status(200).json({
            success: true,
            count: movies.length,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            },
            data: movies
        });
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

        // If hidden and not admin, block
        if (movie.status === 'hidden' && (!req.user || req.user.role !== 'admin')) {
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
