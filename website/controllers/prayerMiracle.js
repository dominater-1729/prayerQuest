const { validationResult } = require("express-validator");

exports.prayerMiracle = async (req, res) => {
  try {
    return res.render("../view/website/prayerMiracle/prayerMiracle.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.prayerMiracleDetails = async (req, res) => {
  try {
    return res.render("../view/website/prayerMiracle/prayerMiracleDetails.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
