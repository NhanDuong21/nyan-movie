const express = require('express');
const router = express.Router();
const { 
    addEpisode, updateEpisode, deleteEpisode, getEpisodes, bulkAddEpisodes 
} = require('../controllers/episode.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, verifyAdmin, getEpisodes);
router.post('/:movieId', verifyToken, verifyAdmin, addEpisode);
router.post('/:movieId/bulk', verifyToken, verifyAdmin, bulkAddEpisodes);

router.route('/:id')
    .put(verifyToken, verifyAdmin, updateEpisode)
    .delete(verifyToken, verifyAdmin, deleteEpisode);

module.exports = router;
