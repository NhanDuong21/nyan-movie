const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    type: {
        type: String,
        enum: ['favorite', 'history'],
        required: true
    },
    episode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Episode'
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness for favorites, and quick updates for history
InteractionSchema.index({ user: 1, movie: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Interaction', InteractionSchema);
