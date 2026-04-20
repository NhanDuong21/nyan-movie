const express = require('express');
const router = express.Router();
const { 
    getAllGenres, createGenre, deleteGenre,
    getAllCountries, createCountry, deleteCountry,
    getAllYears, createYear, deleteYear
} = require('../controllers/category.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// GENRES
router.route('/genres')
    .get(getAllGenres)
    .post(verifyToken, verifyAdmin, createGenre);

router.route('/genres/:id')
    .delete(verifyToken, verifyAdmin, deleteGenre);

// COUNTRIES
router.route('/countries')
    .get(getAllCountries)
    .post(verifyToken, verifyAdmin, createCountry);

router.route('/countries/:id')
    .delete(verifyToken, verifyAdmin, deleteCountry);

// YEARS
router.route('/years')
    .get(getAllYears)
    .post(verifyToken, verifyAdmin, createYear);

router.route('/years/:id')
    .delete(verifyToken, verifyAdmin, deleteYear);

module.exports = router;
