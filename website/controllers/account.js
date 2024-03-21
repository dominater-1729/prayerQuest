const { validationResult } = require("express-validator");
let decryption = require("../../helpers/decryptData.js");
let encryption = require("../../helpers/encryptData.js");
const path = require("path");
let nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

let transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "dinesh@authenticode.in",
    pass: "d9w4jmWQ0ND2c8Ca",
  },
});

//models
const userModel = require("../../models/user");
const queryModel = require("../../models/queryMessage");

exports.contact = async (req, res) => {
  try {
    let id = req.session.user;
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/account/contactUs.hbs", {
      id,
      successToast,
      errorToast,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.sendQuery = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let userId = req.params.id;
    let { fullname, email, message } = req.body;
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("view"),
        defaultLayout: false,
      },
      viewPath: path.resolve("view"),
    };
    transporter.use("compile", hbs(handlebarOptions));

    var mailOptions = {
      from: `${email} <info@myauthenticode.com>`,
      to: "mohit@authenticode.in",
      subject: "User query process: ",
      template: "query",
      context: {
        name: fullname,
        email: email,
        message: message,
      },
    };
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log({ error });
        res.cookie("errorToast", "Invalid email");
        return res.redirect("back");
      } else {
        let data = new queryModel({
          userId: userId,
          fullname: encryption(fullname),
          email: encryption(email),
          message: encryption(message),
        });
        await data.save();
        res.cookie("successToast", "Message sent successfully", {
          maxAge: 3000,
        });
        return res.redirect("back");
      }
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.privacy = async (req, res) => {
  try {
    return res.render("../view/website/account/privacy.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.terms = async (req, res) => {
  try {
    return res.render("../view/website/account/terms.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.faqs = async (req, res) => {
  try {
    return res.render("../view/website/account/faqs.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.changePass = async (req, res) => {
  try {
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    let id = req.session.user;
    let users = await userModel.find({ _id: id });
    return res.render("../view/website/account/changePass.hbs", {
      users,
      successToast,
      errorToast,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.updatePass = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let id = req.params.id;
    let { opass, npass } = req.body;
    let userdata = await userModel.find({ _id: id });
    let dbPass = userdata[0].password;
    if (dbPass == encryption(opass)) {
      npass = encryption(npass);
      await userModel.findByIdAndUpdate(
        { _id: id },
        { password: npass },
        { new: true }
      );
      res.cookie("successToast", "Password updated successfully", {
        maxAge: 3000,
      });
      return res.redirect("/website/changePass");
    } else {
      res.cookie("errorToast", "Old password does not match", { maxAge: 3000 });
      return res.redirect("back");
    }
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.work = async (req, res) => {
  try {
    return res.render("../view/website/account/howItWork.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.profile = async (req, res) => {
  try {
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    let id = req.session.user;
    let userdata = await userModel.find({ _id: id });
    return res.render("../view/website/account/profile.hbs", {
      userdata,
      encryption,
      decryption,
      successToast,
      errorToast,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.updateSocialLinks = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let id = req.params.id;
    let { instagram, facebook, linkedIn } = req.body;
    await userModel.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        instagram: encryption(instagram),
        facebook: encryption(facebook),
        linkedIn: encryption(linkedIn),
      },
      { new: true }
    );
    res.cookie("successToast", "Social media links updated", { maxAge: 3000 });
    return res.redirect("/website/profile");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    // return res.send(req.files);
    let id = req.params.id;
    let {
      firstname,
      lastname,
      username,
      organization,
      gender,
      country,
      website,
      phone,
    } = req.body;

    let image;
    let userdata = await userModel.find({ _id: id });
    if (!req.files["userImage"]) {
      image = userdata[0].image;
    } else {
      image = encryption(req.files["userImage"][0].filename);
    }
    let coverImage;
    if (!req.files["cprofile"]) {
      coverImage = userdata[0].coverImage;
    } else {
      coverImage = encryption(req.files["cprofile"][0].filename);
    }

    let update = await userModel.findByIdAndUpdate(
      { _id: id },
      {
        firstname: encryption(firstname),
        lastname: encryption(lastname),
        username: encryption(username),
        organization: encryption(organization),
        gender: encryption(gender),
        country: encryption(country),
        website: encryption(website),
        phone: encryption(phone),
        image: image,
        coverImage: coverImage,
      },
      {
        new: true,
      }
    );
    console.log({ update });
    res.cookie("successToast", "Profile updated successfully", {
      maxAge: 3000,
    });
    return res.redirect("/website/profile");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.followProfile = async (req, res) => {
  try {
    return res.render("../view/website/account/followProfile.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
