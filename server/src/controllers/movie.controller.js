const Movie = require('../models/Movie');
const Episode = require('../models/Episode');
const Genre = require('../models/Genre');
const Country = require('../models/Country');
const Year = require('../models/Year');

exports.getMovies = async (req, res, next) => {
    try {
        const { search, type, genre, country, year, status, recent, select, sort, page, limit } = req.query;
        let filters = {};

        if (type) {
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

        // Status/Visibility
        if (!req.user || req.user.role !== 'admin') {
            filters.status = { $ne: 'hidden' };
        } else if (status) {
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
            // Default to updatedAt so newly updated series jump to top
            query = query.sort('-updatedAt');
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
