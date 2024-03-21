const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const deviceSchema = new mongoose.Schema(
  {
    userId: ObjectId,
    deviceId: { type: String },
    deviceType: { type: String },
    deviceToken: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("userDevices", deviceSchema);
