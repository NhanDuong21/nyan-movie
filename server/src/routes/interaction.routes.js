const express = require('express');
const router = express.Router();
const { 
    toggleFavorite, 
    getFavorites, 
    addToHistory, 
    getHistory,
    checkFavorite
} = require('../controllers/interaction.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken); // All interaction routes require auth

router.post('/favorite', toggleFavorite);
router.get('/favorite', getFavorites);
router.get('/favorite/check/:movieId', checkFavorite);

router.post('/history', addToHistory);
router.get('/history', getHistory);

module.exports = router;
