const mongoose = require('mongoose');

const yearSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: [true, 'Release year is required'],
        unique: true
    }
});

yearSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Year', yearSchema);
