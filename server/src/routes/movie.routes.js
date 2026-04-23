const express = require('express');
const router = express.Router();
const { 
    getMovies, getMovieBySlug, createMovie, updateMovie, deleteMovie, getMovieById, incrementView, getRecommendations, rateMovie
} = require('../controllers/movie.controller');
const { verifyToken, verifyAdmin, optionalAuth } = require('../middlewares/auth.middleware');

router.route('/')
    .get(optionalAuth, getMovies)
    .post(verifyToken, verifyAdmin, createMovie);

router.route('/slug/:slug')
    .get(optionalAuth, getMovieBySlug);

router.route('/:id')
    .get(getMovieById)
    .put(verifyToken, verifyAdmin, updateMovie)
    .delete(verifyToken, verifyAdmin, deleteMovie);

router.post('/:movieId/episodes/:episodeId/view', incrementView);
router.get('/:id/recommendations', getRecommendations);
router.post('/:id/rate', verifyToken, rateMovie);

module.exports = router;
