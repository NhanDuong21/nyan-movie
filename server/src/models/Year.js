const mongoose = require('mongoose');

const yearSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: [true, 'Release year is required'],
        unique: true
    }
});

module.exports = mongoose.model('Year', yearSchema);
