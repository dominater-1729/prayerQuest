const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    prayerId: { type: ObjectId, required: true },
    media: { type: String },
    userId: { type: ObjectId, required: true },
    type: { type: String, }
}, { timestamps: true })

module.exports = new mongoose.model('Comment', commentSchema);