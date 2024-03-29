const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

let prayerCircleSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    groupImage: { type: String, default: null },
    groupName: { type: String, required: true },
    description: { type: String, required: true },
    members: { type: [mongoose.Schema.Types.ObjectId], ref: 'user', default: [] },
    pending: { type: [ObjectId], default: [], ref: 'user' }
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("circlePrayers", prayerCircleSchema);
