const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: false
        },
        googleId: {
            type: String,
            default: null
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local'
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        avatar: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        },
        is_root: {
            type: Boolean,
            default: false
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        loginHistory: [
            {
                ip: String,
                userAgent: String,
                location: { type: String, default: 'Unknown' },
                time: { type: Date, default: Date.now }
            }
        ]
    },
    {
        timestamps: true
    }
);

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
