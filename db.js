const mongoose = require("mongoose");
const session = require("express-session");
const mongoDBStore = require("connect-mongo")(session);
const URI = `mongodb+srv://kundan:Oy6IP3Es6iSpAYsX@cluster0.c8z5ezw.mongodb.net/prayerQuest`;

mongoose
  .connect(URI)
  .then(() => {
    console.log("connect with database");
  })
  .catch((err) => {
    console.error("Error connecting to mongodb", err);
  });

const store = new mongoDBStore({
  mongooseConnection: mongoose.connection,
  collection: "session",
});

module.exports = store;
