const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllUsers, 
    createUser,
    updateUser,
    updateUserRole, 
    toggleBanUser,
    deleteUser 
} = require('../controllers/admin.controller');
const { getAdminMovies } = require('../controllers/movie.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// Protect all routes
router.use(verifyToken);
router.use(verifyAdmin);

router.get('/movies', getAdminMovies);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/ban', toggleBanUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
