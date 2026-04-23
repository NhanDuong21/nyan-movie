const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

// Load environment variables (mostly needed if this is run independently or early)
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nyan-movie',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        // transformation: [{ width: 1000, crop: 'limit' }] // Optional: limit size
    }
});

module.exports = { cloudinary, storage };
