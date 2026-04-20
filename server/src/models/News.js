const mongoose = require('mongoose');
const slugify = require('slugify');

const NewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    thumbnail: {
        type: String,
        required: [true, 'Please add a thumbnail URL']
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create slug from title before saving
NewsSchema.pre('save', async function() {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
});

module.exports = mongoose.model('News', NewsSchema);
