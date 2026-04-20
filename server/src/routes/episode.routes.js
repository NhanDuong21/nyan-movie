const express = require('express');
const router = express.Router();
const { 
    addEpisode, updateEpisode, deleteEpisode 
} = require('../controllers/episode.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

router.post('/:movieId', verifyToken, verifyAdmin, addEpisode);

router.route('/:id')
    .put(verifyToken, verifyAdmin, updateEpisode)
    .delete(verifyToken, verifyAdmin, deleteEpisode);

module.exports = router;
