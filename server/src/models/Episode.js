const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Movie reference is required']
    },
    name: {
        type: String,
        required: [true, 'Episode name is required']
    },
    episodeNumber: {
        type: Number,
        required: [true, 'Episode number is required']
    },
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required']
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for unique episodes within a movie
episodeSchema.index({ movie: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model('Episode', episodeSchema);
