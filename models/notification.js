const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    type: { type: String, required: true },
    to: { type: ObjectId, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
    image: { type: String },
    isRead: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = new mongoose.model('Notification', notificationSchema);