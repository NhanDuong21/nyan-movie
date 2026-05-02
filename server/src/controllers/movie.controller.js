const Movie = require('../models/Movie');
const Episode = require('../models/Episode');
const Genre = require('../models/Genre');
const Country = require('../models/Country');
const Year = require('../models/Year');
const Rating = require('../models/Rating');
const mongoose = require('mongoose');
const slugify = require('slugify');
const { redisClient } = require('../config/redis');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to invalidate movie list caches
const clearMovieListCache = async () => {
    try {
        if (!redisClient || !redisClient.isReady) return;
        
        // Find all keys matching the movie list pattern
        const keys = await redisClient.keys('movies:list:*');
        
        if (keys.length > 0) {
            // Delete all matching keys
            await redisClient.del(keys);
            console.log(`Cache Invalidation: Cleared ${keys.length} movie list cache keys.`);
        }
    } catch (error) {
        console.error('Redis Cache Invalidation Error:', error);
    }
};

exports.getMovies = async (req, res, next) => {
    try {
        const cacheKey = `movies:list:${JSON.stringify(req.query || {})}`;

        try {
            if (redisClient && redisClient.isReady) {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    console.log('Serving from Redis Cache:', cacheKey);
                    return res.status(200).json(JSON.parse(cachedData));
                }
            }
        } catch (cacheError) {
            console.error('Redis GET Error:', cacheError);
        }

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
        let query = Movie.find(filters)
            .populate('genres', '-__v -createdAt -updatedAt')
            .populate('country', '-__v -createdAt -updatedAt')
            .populate('year', '-__v -createdAt -updatedAt');

        // Select Fields
        if (select) {
            const fields = select.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v -createdAt -updatedAt');
        }

        // Sort
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else if (recent) {
            // Default to updatedAt for "Recently Updated" sections
            query = query.sort('-updatedAt');
        } else {
            // Default to createdAt for "Latest Releases"
            query = query.sort('-createdAt');
        }

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const startIndex = (pageNum - 1) * limitNum;
        const total = await Movie.countDocuments(filters);

        query = query.skip(startIndex).limit(limitNum);

        const movies = await query;

        const responseData = {
            success: true,
            count: movies.length,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            },
            data: movies
        };

        try {
            if (redisClient && redisClient.isReady) {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
                console.log('Saved to Redis Cache:', cacheKey);
            }
        } catch (cacheSetError) {
            console.error('Redis SET Error:', cacheSetError);
        }

        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
};

exports.getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id)
            .select('-__v -createdAt -updatedAt')
            .populate('genres', '-__v -createdAt -updatedAt')
            .populate('country', '-__v -createdAt -updatedAt')
            .populate('year', '-__v -createdAt -updatedAt');

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
        const movie = await Movie.findOne({ slug: req.params.slug })
            .select('-__v -createdAt -updatedAt')
            .populate('genres', '-__v -createdAt -updatedAt')
            .populate('country', '-__v -createdAt -updatedAt')
            .populate('year', '-__v -createdAt -updatedAt');

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
                ...movie.toJSON(),
                episodes: episodes.map(ep => ep.toJSON())
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
        let query = Movie.find(filters)
            .populate('genres', '-__v -createdAt -updatedAt')
            .populate('country', '-__v -createdAt -updatedAt')
            .populate('year', '-__v -createdAt -updatedAt');

        // Select Fields
        if (select) {
            const fields = select.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
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
        await clearMovieListCache();
        res.status(201).json({ success: true, data: movie });
    } catch (error) {
        next(error);
    }
};

exports.updateMovie = async (req, res, next) => {
    try {
        const updateData = { ...req.body };

        if (updateData.title) {
            updateData.slug = slugify(updateData.title, {
                lower: true,
                strict: true,
                locale: 'vi',
                trim: true
            });
        }

        const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

        await clearMovieListCache();

        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        next(error);
    }
};

exports.deleteMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, { status: 'hidden' }, { returnDocument: 'after' });
        
        if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

        await clearMovieListCache();

        res.status(200).json({ success: true, message: 'Movie status set to hidden' });
    } catch (error) {
        next(error);
    }
};


exports.incrementView = async (req, res, next) => {
    try {
        const { movieId, episodeId } = req.params;

        await Promise.all([
            Movie.findByIdAndUpdate(movieId, { $inc: { views: 1 } }, { returnDocument: 'after', timestamps: false }),
            Episode.findByIdAndUpdate(episodeId, { $inc: { views: 1 } }, { returnDocument: 'after', timestamps: false })
        ]);

        res.status(200).json({ success: true, message: 'View incremented' });
    } catch (error) {
        next(error);
    }
};


exports.getRecommendations = async (req, res, next) => {
    try {
        const { id } = req.params;

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

        const scored = candidates.map(candidate => {
            let score = 0;

            const candidateGenreIds = (candidate.genres || []).map(g => g._id.toString());
            if (candidateGenreIds.some(id => sourceGenreIds.includes(id))) score += 5;

            const candidateTags = candidate.tags || [];
            if (sourceTags.length > 0 && candidateTags.some(t => sourceTags.includes(t))) score += 4;

            if (candidate.country?._id?.toString() === sourceCountryId) score += 3;

            if (candidate.type === sourceType) score += 3;

            if ((candidate.views || 0) > HIGH_VIEWS_THRESHOLD) score += 1;

            if ((candidate.ratingAverage || 0) >= 8.0) score += 1;

            if (new Date(candidate.createdAt) >= thirtyDaysAgo) score += 1;

            return { ...candidate, score };
        });

        const recommendations = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);

        res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
        next(error);
    }
};

exports.rateMovie = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { score } = req.body;

        if (!score || score < 1 || score > 10) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn điểm từ 1 đến 10.' });
        }

        if (req.user.role === 'admin' || req.user.is_root || req.user.email === 'sgoku4880@gmail.com') {
            return res.status(403).json({ success: false, message: 'Quản trị viên không thể đánh giá phim.' });
        }

        await Rating.findOneAndUpdate(
            { user: req.user.id, movie: id },
            { score },
            { upsert: true, returnDocument: 'after' }
        );

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

        const updatedMovie = await Movie.findByIdAndUpdate(
            id,
            { ratingAverage, ratingCount },
            { returnDocument: 'after' }
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

exports.searchMoviesByAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ success: false, message: 'Please provide a valid search prompt.' });
        }

        const cacheKey = `ai:search:${prompt.toLowerCase().trim()}`;
        try {
            if (redisClient && redisClient.isReady) {
                const cachedResult = await redisClient.get(cacheKey);
                if (cachedResult) {
                    console.log('Serving AI result from Redis Cache:', cacheKey);
                    return res.status(200).json(JSON.parse(cachedResult));
                }
            }
        } catch (cacheErr) {
            console.error('Redis Get Error in AI Search:', cacheErr);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const systemPrompt = `You are an AI movie assistant for a Vietnamese streaming site. First, carefully evaluate if the user's input is related to finding movies, describing a mood, requesting recommendations, or discussing film genres. If the input is just a simple greeting (e.g., "hello", "hi", "chào"), gibberish, or entirely unrelated to movies/moods, return EXACTLY this JSON: {"isRelevant": false}. If the input IS relevant, analyze it and return EXACTLY this JSON: {"isRelevant": true, "genres": ["genre1"], "countries": ["country1"], "tags": ["keyword1"]}. Return ONLY a valid JSON object with NO markdown formatting. User input: "${prompt}"`;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text().trim();
        
        const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        let aiData;
        try {
            aiData = JSON.parse(cleanJsonString);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', responseText);
            return res.status(500).json({ success: false, message: 'AI failed to generate valid parameters.' });
        }

        if (aiData.isRelevant === false) {
            return res.status(400).json({ 
                success: false, 
                message: "Xin lỗi, Nyan chỉ hiểu các yêu cầu về tìm phim hoặc chia sẻ tâm trạng. Bạn gõ cụ thể hơn được không?" 
            });
        }

        const baseConditions = [
            { status: { $ne: 'hidden' } }, 
            { totalEpisodes: { $gt: 0 } }  
        ];

        const aiSearchConditions = [];
        
        if (aiData.genres && aiData.genres.length > 0) {
            const genreRegex = aiData.genres.map(g => new RegExp(g, 'i'));
            const genreDocs = await Genre.find({ name: { $in: genreRegex } });
            if (genreDocs.length > 0) {
                aiSearchConditions.push({ genres: { $in: genreDocs.map(g => g._id) } });
            }
        }
        
        if (aiData.countries && aiData.countries.length > 0) {
            const countryRegex = aiData.countries.map(c => new RegExp(c, 'i'));
            const countryDocs = await Country.find({ name: { $in: countryRegex } });
            if (countryDocs.length > 0) {
                aiSearchConditions.push({ country: { $in: countryDocs.map(c => c._id) } });
            }
        }
        
        if (aiData.tags && aiData.tags.length > 0) {
            const tagRegex = aiData.tags.map(t => new RegExp(t, 'i'));
            aiSearchConditions.push({ title: { $in: tagRegex } });
            aiSearchConditions.push({ description: { $in: tagRegex } });
        }

        const query = { $and: baseConditions };
        
        if (aiSearchConditions.length > 0) {
            query.$and.push({ $or: aiSearchConditions });
        }

        const movies = await Movie.find(query)
            .populate('genres', 'name slug')
            .populate('country', 'name slug')
            .limit(12);
        
        const responseData = { 
            success: true, 
            aiAnalysis: aiData, 
            movies 
        };

        try {
            if (redisClient && redisClient.isReady) {
                await redisClient.setEx(cacheKey, 604800, JSON.stringify(responseData));
                console.log('Saved AI result to Redis Cache:', cacheKey);
            }
        } catch (cacheSetErr) {
            console.error('Redis Set Error in AI Search:', cacheSetErr);
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error('AI Search Endpoint Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error during AI processing.',
            errorDetail: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
