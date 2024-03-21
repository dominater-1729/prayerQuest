const { validationResult } = require("express-validator");

exports.videos = async (req, res) => {
  try {
    return res.render("../view/website/videos/videos.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.videoDetails = async (req, res) => {
  try {
    return res.render("../view/website/videos/videoDetails.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
