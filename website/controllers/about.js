const mongoose = require("mongoose");
const validationResult = require("express-validator");

exports.about = async (req, res) => {
  try {
    return res.render("../view/website/about/about.hbs");
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
};

