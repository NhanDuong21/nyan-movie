const express = require('express');
const router = express.Router();
const { 
    getMovies, getMovieBySlug, createMovie, updateMovie, deleteMovie, getMovieById, incrementView, getRecommendations
} = require('../controllers/movie.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

router.route('/')
    .get(getMovies)
    .post(verifyToken, verifyAdmin, createMovie);

router.route('/slug/:slug')
    .get(getMovieBySlug);

router.route('/:id')
    .get(getMovieById)
    .put(verifyToken, verifyAdmin, updateMovie)
    .delete(verifyToken, verifyAdmin, deleteMovie);

router.post('/:movieId/episodes/:episodeId/view', incrementView);
router.get('/:id/recommendations', getRecommendations);

module.exports = router;
