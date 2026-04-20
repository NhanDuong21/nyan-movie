const mongoose = require('mongoose');
const slugify = require('slugify');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Genre name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    }
});

// Pre-save hook to generate slug
genreSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('Genre', genreSchema);
