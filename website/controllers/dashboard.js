const mongoose = require("mongoose");
const validationResult = require("express-validator");
const prayerCircleController = require("../controllers/prayerCircle");
let decryption = require("../../helpers/decryptData.js");
const publicSquareController = require("./publicSquare");

exports.dashboard = async (req, res) => {
  try {
    const { successToast, errorToast } = req.cookies || {};
    const userId = new mongoose.Types.ObjectId(req.session.user);
    req.query.limit = 6;
    req.query.skip = 0;
    req.query.createdAt = -1;
    const prayerCircleList = await prayerCircleController.listGroups({ query: req.query, userId });
    const publicSquareList = await publicSquareController.listPublicSquare({ query: req.query });
    console.log("publicSquareList", publicSquareList);
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/dashboard/dashboard.hbs", {
      successToast,
      errorToast,
      decryption,
      prayerCircleList,
      publicSquareList
    });
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
};
