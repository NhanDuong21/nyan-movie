const express = require('express');
const router = express.Router();
const { 
    getMovieComments, 
    addComment, 
    deleteComment 
} = require('../controllers/comment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, addComment);
router.get('/movie/:movieId', getMovieComments);
router.delete('/:id', verifyToken, deleteComment);

module.exports = router;
