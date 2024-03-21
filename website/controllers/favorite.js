const { validationResult } = require("express-validator");

exports.favorite = async (req, res) => {
  try {
    return res.render("../view/website/favorite/favorite.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
