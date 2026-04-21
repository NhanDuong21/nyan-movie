const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllUsers, 
    createUser,
    updateUser,
    updateUserRole, 
    deleteUser 
} = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// Protect all routes
router.use(verifyToken);
router.use(verifyAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
