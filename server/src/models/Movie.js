const mongoose = require('mongoose');
const slugify = require('slugify');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Movie title is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String
    },
    poster: {
        type: String,
        default: ''
    },
    backdrop: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['single', 'series', 'hoathinh', 'chieurap'],
        required: [true, 'Movie type is required']
    },
    duration: {
        type: Number,
        default: 0
    },
    totalEpisodes: {
        type: Number,
        default: 1
    },
    actors: {
        type: String,
        default: ''
    },
    director: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        default: ''
    },
    views: {
        type: Number,
        default: 0
    },
    genres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre'
    }],
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    year: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Year'
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'hidden'],
        default: 'ongoing'
    }
}, {
    timestamps: true
});

// Search indexing
movieSchema.index(
    { title: 'text', description: 'text' }, 
    { language_override: 'dummy_language_override' }
);

movieSchema.pre('save', async function() {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
});

module.exports = mongoose.model('Movie', movieSchema);
