const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.put('/profile', verifyToken, updateProfile);

module.exports = router;
