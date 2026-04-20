const mongoose = require('mongoose');
const slugify = require('slugify');

const countrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Country name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    }
});

countrySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('Country', countrySchema);
