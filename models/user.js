const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true },
    organization: { type: String, required: true },
    countryCode: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, required: true },
    zipcode: { type: String, required: true },
    gender: { type: String, required: true },
    password: { type: String, default: null },
    otp: { type: String, default: null },
    version: { type: String, default: null },
    deleted: { type: Number, default: 0 },
    deleted_date: { type: Date, default: null },
    image: { type: String, default: null },
    country: { type: String, default: null },
    website: { type: String, default: null },
    instagram: { type: String, default: null },
    facebook: { type: String, default: null },
    linkedIn: { type: String, default: null },
    coverImage: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);
module.exports = User;
