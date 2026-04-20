const express = require('express');
const router = express.Router();
const { 
    getMovies, getMovieBySlug, createMovie, updateMovie, deleteMovie 
} = require('../controllers/movie.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

router.route('/')
    .get(getMovies)
    .post(verifyToken, verifyAdmin, createMovie);

router.route('/slug/:slug')
    .get(getMovieBySlug);

router.route('/:id')
    .put(verifyToken, verifyAdmin, updateMovie)
    .delete(verifyToken, verifyAdmin, deleteMovie);

module.exports = router;
