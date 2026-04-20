const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, verifyAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn một file để upload' });
    }

    // Return the public URL for the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
        success: true,
        url: fileUrl,
        message: 'Upload thành công'
    });
});

module.exports = router;
