const { validationResult } = require("express-validator");

exports.originalListing = async (req, res) => {
  try {
    return res.render("../view/website/originals/original.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.originalDetails = async (req, res) => {
  try {
    return res.render("../view/website/originals/originalDetails.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
