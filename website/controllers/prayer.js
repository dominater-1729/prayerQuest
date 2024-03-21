const { validationResult } = require("express-validator");

exports.prayer = async (req, res) => {
  try {
    return res.render("../view/website/prayer/prayer.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
