const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true, 
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique:true,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        enum: ['SuperAdmin', 'ClientUser'],
    },
    profilePic: {
        type: String,
    },
    country: {
        type: String,
    },
   otp:[{
        otp: {
            type: String,
        },
        otpExpiresAt: {
            type: Date,
        },
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date, 
        default: Date.now, 
    },

});

const User = mongoose.model('User', UserSchema);

module.exports = User;


