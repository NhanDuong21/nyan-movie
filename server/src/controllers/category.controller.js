const Genre = require('../models/Genre');
const Country = require('../models/Country');
const Year = require('../models/Year');

// GENRES
exports.getAllGenres = async (req, res, next) => {
    try {
        const genres = await Genre.find().sort({ name: 1 });
        res.status(200).json({ success: true, count: genres.length, data: genres });
    } catch (error) {
        next(error);
    }
};

exports.createGenre = async (req, res, next) => {
    try {
        const genre = await Genre.create(req.body);
        res.status(201).json({ success: true, data: genre });
    } catch (error) {
        next(error);
    }
};

exports.deleteGenre = async (req, res, next) => {
    try {
        const genre = await Genre.findByIdAndDelete(req.params.id);
        if (!genre) return res.status(404).json({ success: false, message: 'Genre not found' });
        res.status(200).json({ success: true, message: 'Genre deleted' });
    } catch (error) {
        next(error);
    }
};

// COUNTRIES
exports.getAllCountries = async (req, res, next) => {
    try {
        const countries = await Country.find().sort({ name: 1 });
        res.status(200).json({ success: true, count: countries.length, data: countries });
    } catch (error) {
        next(error);
    }
};

exports.createCountry = async (req, res, next) => {
    try {
        const country = await Country.create(req.body);
        res.status(201).json({ success: true, data: country });
    } catch (error) {
        next(error);
    }
};

exports.deleteCountry = async (req, res, next) => {
    try {
        const country = await Country.findByIdAndDelete(req.params.id);
        if (!country) return res.status(404).json({ success: false, message: 'Country not found' });
        res.status(200).json({ success: true, message: 'Country deleted' });
    } catch (error) {
        next(error);
    }
};

// YEARS
exports.getAllYears = async (req, res, next) => {
    try {
        const years = await Year.find().sort({ year: -1 });
        res.status(200).json({ success: true, count: years.length, data: years });
    } catch (error) {
        next(error);
    }
};

exports.createYear = async (req, res, next) => {
    try {
        const year = await Year.create(req.body);
        res.status(201).json({ success: true, data: year });
    } catch (error) {
        next(error);
    }
};

exports.deleteYear = async (req, res, next) => {
    try {
        const year = await Year.findByIdAndDelete(req.params.id);
        if (!year) return res.status(404).json({ success: false, message: 'Year not found' });
        res.status(200).json({ success: true, message: 'Year deleted' });
    } catch (error) {
        next(error);
    }
};
