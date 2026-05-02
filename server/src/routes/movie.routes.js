const express = require('express');
const router = express.Router();
const { 
    getMovies, getMovieBySlug, createMovie, updateMovie, deleteMovie, getMovieById, incrementView, getRecommendations, rateMovie, searchMoviesByAI
} = require('../controllers/movie.controller');
const { getEpisodes } = require('../controllers/episode.controller');
const { verifyToken, verifyAdmin, optionalAuth } = require('../middlewares/auth.middleware');

router.route('/')
    .get(optionalAuth, getMovies)
    .post(verifyToken, verifyAdmin, createMovie);

router.route('/slug/:slug')
    .get(optionalAuth, getMovieBySlug);

router.post('/ai-search', searchMoviesByAI);

router.route('/:id')
    .get(getMovieById)
    .put(verifyToken, verifyAdmin, updateMovie)
    .delete(verifyToken, verifyAdmin, deleteMovie);

router.get('/:id/episodes', getEpisodes);
router.post('/:movieId/episodes/:episodeId/view', incrementView);
router.get('/:id/recommendations', getRecommendations);
router.post('/:id/rate', verifyToken, rateMovie);

module.exports = router;
