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
genreSchema.pre('save', async function() {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

genreSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Genre', genreSchema);
