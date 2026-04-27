const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Ensure a user can only rate a movie once
ratingSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
