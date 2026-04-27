const Genre = require('../models/Genre');
const Country = require('../models/Country');
const Year = require('../models/Year');

// GENRES
exports.getAllGenres = async (req, res, next) => {
    try {
        const genres = await Genre.find().select('-__v -createdAt -updatedAt').sort({ name: 1 });
        res.status(200).json({ success: true, count: genres.length, data: genres });
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

exports.createGenre = async (req, res, next) => {
    try {
        const genre = await Genre.create(req.body);
        res.status(201).json({ success: true, data: genre });
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

exports.deleteGenre = async (req, res, next) => {
    try {
        const genre = await Genre.findByIdAndDelete(req.params.id);
        if (!genre) return res.status(404).json({ success: false, message: 'Genre not found' });
        res.status(200).json({ success: true, message: 'Genre deleted' });
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// COUNTRIES
exports.getAllCountries = async (req, res, next) => {
    try {
        const countries = await Country.find().select('-__v -createdAt -updatedAt').sort({ name: 1 });
        res.status(200).json({ success: true, count: countries.length, data: countries });
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

exports.createCountry = async (req, res, next) => {
    try {
        const country = await Country.create(req.body);
        res.status(201).json({ success: true, data: country });
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

exports.deleteCountry = async (req, res, next) => {
    try {
        const country = await Country.findByIdAndDelete(req.params.id);
        if (!country) return res.status(404).json({ success: false, message: 'Country not found' });
        res.status(200).json({ success: true, message: 'Country deleted' });
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// YEARS
exports.getAllYears = async (req, res, next) => {
    try {
        const years = await Year.find().select('-__v -createdAt -updatedAt').sort({ year: -1 });
        res.status(200).json({ success: true, count: years.length, data: years });
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

exports.createYear = async (req, res, next) => {
    try {
        const year = await Year.create(req.body);
        res.status(201).json({ success: true, data: year });
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

exports.deleteYear = async (req, res, next) => {
    try {
        const year = await Year.findByIdAndDelete(req.params.id);
        if (!year) return res.status(404).json({ success: false, message: 'Year not found' });
        res.status(200).json({ success: true, message: 'Year deleted' });
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
