const express = require('express');
const router = express.Router();
const {
    getAllNews,
    getNewsBySlug,
    createNews,
    updateNews,
    deleteNews
} = require('../controllers/news.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

router.get('/', getAllNews);
router.get('/:slug', getNewsBySlug);

// Admin only routes
router.post('/', verifyToken, verifyAdmin, createNews);
router.put('/:id', verifyToken, verifyAdmin, updateNews);
router.delete('/:id', verifyToken, verifyAdmin, deleteNews);

module.exports = router;
