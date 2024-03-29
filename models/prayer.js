let mongoose = require("mongoose");
let Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

let prayerSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: 'user', required: true },
    groupId: { type: ObjectId, ref: 'circlePrayers', default: null },
    title: { type: String, required: true },
    postType: { type: String, required: true },
    description: { type: String, required: true },
    prayerImage: { type: String, default: null },
    prayerVideo: { type: String, default: null },
    type: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("prayers", prayerSchema);
