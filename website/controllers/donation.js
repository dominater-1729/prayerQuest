const { validationResult } = require("express-validator");

exports.donate = async (req, res) => {
  try {
    return res.render("../view/website/give/give.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
