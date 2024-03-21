const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
let decrytption = require("../../helpers/decryptData.js");
let encryption = require("../../helpers/encryptData.js");
const path = require("path");
let nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
let userModel = require("../../models/user");

let transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "dinesh@authenticode.in",
    pass: "d9w4jmWQ0ND2c8Ca",
  },
});

exports.login = async (req, res) => {
  try {
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/login.hbs", {
      successToast,
      errorToast,
    });
  } catch (error) {
    res.redirect("back");
  }
};

exports.userLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let { email, password } = req.body;
    email = encryption(email);
    let userData = await userModel.find({ email });
    if (userData.length > 0) {
      let dbPassword = userData[0].password;
      if (dbPassword == encryption(password)) {
        let _id = userData[0]._id;
        req.session.user = _id;
        req.session.userAuth = true;
        req.session.save();
        res.cookie("successToast", "Login successfully", { maxAge: 3000 });
        return res.redirect("/website/dashboard");
      } else {
        res.cookie("errorToast", "Invalid credentials", { maxAge: 3000 });
        return res.redirect("/website/login");
      }
    } else {
      res.cookie("errorToast", "Invalid credentials", { maxAge: 3000 });
      return res.redirect("/website/login");
    }
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
};

exports.register = async (req, res) => {
  try {
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/register.hbs", {
      successToast,
      errorToast,
    });
  } catch (error) {
    res.redirect("back");
  }
};

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let {
      firstname,
      lastname,
      username,
      organization,
      email,
      countryCode,
      phone,
      gender,
      zipcode,
      password,
    } = req.body;
    email = encryption(email);
    let userData = await userModel.find({ email });
    if (userData.length > 0) {
      res.cookie("errorToast", "Email already exist", { maxAge: 3000 });
      return res.redirect("back");
    } else {
      let data = new userModel({
        firstname: encryption(firstname),
        lastname: encryption(lastname),
        username: encryption(username),
        organization: encryption(organization),
        countryCode: encryption(countryCode),
        phone: encryption(phone),
        email: email,
        gender: encryption(gender),
        zipcode: encryption(zipcode),
        password: encryption(password),
      });
      let userdata = await data.save();
      let _id = userdata._id;
      req.session.user = _id;
      req.session.userAuth = true;
      req.session.save();
      res.cookie("successToast", "Signup successfully", { maxAge: 3000 });
      return res.redirect("/website/dashboard");
    }
  } catch (error) {
    res.redirect("back");
  }
};

exports.forgotPass = async (req, res) => {
  try {
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/forgotpass.hbs", {
      successToast,
      errorToast,
    });
  } catch (error) {
    res.redirect("back");
  }
};

exports.sendOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let { email } = req.body;
    email = encryption(email);
    let userData = await userModel.find({ email });
    if (userData.length > 0) {
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("view"),
          defaultLayout: false,
        },
        viewPath: path.resolve("view"),
      };
      transporter.use("compile", hbs(handlebarOptions));
      let OTPP = Math.floor(1000 + Math.random() * 9000);
      OTPP = parseInt(OTPP);
      await userModel.findByIdAndUpdate(
        { _id: userData[0]._id },
        { otp: OTPP },
        { new: true }
      );
      let mail = decrytption(email);
      var mailOptions = {
        from: "PrayerQuest <info@myauthenticode.com>",
        to: mail,
        subject: "Forgot password process: ",
        template: "otp",
        context: {
          otp: OTPP,
        },
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log({ error });
          res.cookie("errorToast", "Invalid email");
          return res.redirect("back");
        } else {
          res.cookie("successToast", "Otp sent successfully", {
            maxAge: 3000,
          });
          let userEmail = btoa(mail);
          return res.redirect(`/website/otp?email=${userEmail}`);
        }
      });
    }
  } catch (error) {
    res.redirect("back");
  }
};

exports.otp = async (req, res) => {
  try {
    let email = req.query.email;
    email = atob(email);
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/otp.hbs", {
      successToast,
      errorToast,
      email,
    });
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
};

exports.verifyOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let { otp1, otp2, otp3, otp4, email } = req.body;
    email = encryption(email);
    let otp = `${otp1}${otp2}${otp3}${otp4}`;
    let userData = await userModel.find({ email });
    let dbOtp = userData[0].otp;
    if (dbOtp == otp) {
      res.cookie("successToast", "Otp match successfully", { maxAge: 3000 });
      return res.redirect(`/website/resetpass?email=${email}`);
    } else {
      res.cookie("errorToast", "Otp not matched", { maxAge: 3000 });
      return res.redirect("back");
    }
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
};

exports.resetPass = async (req, res) => {
  try {
    let email = req.query.email;
    email = decrytption(email);
    console.log({ email });
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/resetpass.hbs", {
      successToast,
      errorToast,
      email,
    });
  } catch (error) {
    res.redirect("back");
  }
};

exports.updatePass = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let { newpass, email } = req.body;
    email = encryption(email);
    let userData = await userModel.find({ email });
    if (userData.length > 0) {
      newpass = encryption(newpass);
      await userModel.findByIdAndUpdate(
        { _id: userData[0]._id },
        { password: newpass }
      );
      res.cookie("successToast", "Passsword reset successfully", {
        maxAge: 3000,
      });
      return res.redirect("/website/success");
    } else {
      res.cookie("errorToast", "User does not exist", { maxAge: 3000 });
      res.redirect("back");
    }
  } catch (error) {
    res.redirect("back");
  }
};

exports.successpassword = async (req, res) => {
  try {
    return res.render("../view/website/success.hbs");
  } catch (error) {
    res.redirect("back");
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy();
    return res.redirect("/website/login");
  } catch (error) {
    res.redirect("back");
  }
};
