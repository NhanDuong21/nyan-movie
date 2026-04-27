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

countrySchema.pre('save', async function() {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

countrySchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Country', countrySchema);
