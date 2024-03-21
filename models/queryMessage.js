const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const querySchema = new mongoose.Schema(
  {
    userId: ObjectId,
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("queryMessage", querySchema);
