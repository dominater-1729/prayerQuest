const { validationResult } = require("express-validator");

exports.membership = async (req, res) => {
  try {
    return res.render("../view/website/membership/membership.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
