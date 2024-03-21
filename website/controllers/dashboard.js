const mongoose = require("mongoose");
const validationResult = require("express-validator");

exports.dashboard = async (req, res) => {
  try {
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/dashboard/dashboard.hbs", {
      successToast,
      errorToast,
    });
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
};
