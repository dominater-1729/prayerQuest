const { validationResult } = require("express-validator");
let userModel = require("../../models/user");
let circleModel = require("../../models/circlePrayer");
let decryption = require("../../helpers/decryptData.js");
let encryption = require("../../helpers/encryptData.js");

exports.prayerCircle = async (req, res) => {
  try {
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/prayerCircle/prayerCircle.hbs", {
      successToast,
      errorToast,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.createGroup = async (req, res) => {
  try {
    let id = req.session.user;
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/prayerCircle/createGroup.hbs", {
      id,
      successToast,
      errorToast,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.createCircleGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let id = req.params.id;
    let { groupName, description } = req.body;
    let groupImage;
    if (req.file) {
      groupImage = encryption(req.file.filename);
    }
    let data = new circleModel({
      userId: id,
      groupImage: groupImage,
      groupName: encryption(groupName),
      description: encryption(description),
    });
    await data.save();
    res.cookie("successToast", "Group created successfully", { maxAge: 3000 });
    return res.redirect("/website/prayerCircle");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.privateGroup = async (req, res) => {
  try {
    return res.render("../view/website/prayerCircle/privateGroup.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.privateStaticGroup = async (req, res) => {
  try {
    return res.render("../view/website/prayerCircle/privateGroupStatic.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.groupMembers = async (req, res) => {
  try {
    return res.render("../view/website/prayerCircle/members.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
