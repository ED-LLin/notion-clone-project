const mongoose = require('mongoose');

const SocialDataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    platform: {
        type: String,
        required: false,
        enum: ['facebook', 'instagram', 'youtube', 'other']
    },
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    },
    creator: {
        type: String,
        required: false
    },
    textContent: {
        type: String,
        required: false
    },
    aiTags: [{
        type: String,
        required: false
    }],
    images: [{
        type: String,
        required: false
    }],
    audios: [{
        type: String,
        required: false
    }],
    videos: [{
        type: String,
        required: false
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SocialData', SocialDataSchema);