const { validationResult } = require("express-validator");

exports.inspirationQuotes = async (req, res) => {
  try {
    return res.render(
      "../view/website/inspirationQuotes/inspirationQuotes.hbs"
    );
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
