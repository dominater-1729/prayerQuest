const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
let encryption = require("../../helpers/encryptData");
let decryption = require("../../helpers/decryptData");
const path = require("path");

//nodemailer
let nodemailer = require("nodemailer");
const hbss = require("nodemailer-express-handlebars");

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
const registerModel = require("../../models/user");
const deviceModel = require("../../models/userDevice");

exports.encKeys = async (req, res) => {
  try {
    const secret_key = btoa(process.env.secret_key),
      secret_iv = btoa(process.env.secret_iv);
    return res.json({
      success: "true",
      data: { secret_key, secret_iv },
      message: "Keys fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: "false", error_message: "Something went wrong" });
  }
};

exports.encryptData = async (req, res) => {
  try {
    let bodyData = req.body;

    Object.keys(bodyData).forEach(function (key, index) {
      bodyData[key] = encryption(bodyData[key]);
    });

    return res.json({
      success: "true",
      data: bodyData,
      message: "Work done successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: "false", error_message: "Something went wrong" });
  }
};

exports.decryptData = async (req, res) => {
  try {
    let bodyData = req.body;
    Object.keys(bodyData).forEach(function (key, index) {
      bodyData[key] = decryption(bodyData[key]);
    });

    let responce = {
      success: "true",
      data: bodyData,
      message: "Data go successfully",
    };
    res.send(responce);
  } catch (error) {
    console.log(error);
    let ress = { success: "false", message: "Something went wrong" };
    res.send(ress);
  }
};

exports.userRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let response = {
      success: "false",
      data: {},
      message: errors.array()[0].msg,
    };
    return res.send(response);
  }
  try {
    let {
      firstname,
      lastname,
      username,
      organization,
      countryCode,
      phone,
      email,
      zipcode,
      gender,
      password,
      deviceId,
      deviceType,
      deviceToken,
      version,
    } = req.body;

    let userData = await registerModel.find({ email: email });
    let deviceData = await deviceModel.find({
      deviceId,
      deviceType,
      deviceToken,
    });
    if (userData.length > 0) {
      return res.json({
        success: "false",
        data: {},
        message: "Email already exist",
      });
    } else {
      let data = new registerModel({
        firstname,
        lastname,
        username,
        organization,
        countryCode,
        phone,
        gender,
        email,
        zipcode,
        password,
        version,
      });
      let userdata = await data.save();
      let token = jwt.sign(
        { _id: userdata._id },
        process.env.JWT_SECRET_KEY,
        {}
      );
      if (deviceData.length > 0) {
        await deviceModel.findByIdAndUpdate(
          {
            _id: deviceData._id,
          },
          { userId: userdata._id },
          { new: true }
        );
      } else {
        let device_data = new deviceModel({
          userId: userdata._id,
          deviceId,
          deviceType,
          deviceToken,
        });
        await device_data.save();
      }
      let response = {
        userId: userdata._id,
        firstname: userdata.firstname,
        lastname: userdata.lastname,
        username: userdata.username,
        organization: userdata.organization,
        email: userdata.email,
        countryCode: userdata.countryCode,
        phone: userdata.phone,
        zipcode: userdata.zipcode,
        gender: userdata.gender,
        version: userdata.version,
        image: userdata.image,
        token,
      };
      return res.json({
        success: "true",
        data: response,
        message: "user register successfully",
      });
    }
  } catch (error) {
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.userLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let response = {
      success: "false",
      data: {},
      message: errors.array()[0].msg,
    };
    return res.send(response);
  }
  try {
    let { email, password, version, deviceId, deviceType, deviceToken } =
      req.body;
    let [userData, deviceData] = await Promise.all([
      registerModel.find({ email }),
      deviceModel.find({
        deviceId,
        deviceType,
        deviceToken,
      }),
    ]);
    if (userData.length > 0) {
      let dbPassword = userData[0].password;
      if (password == dbPassword) {
        const token = jwt.sign(
          { _id: userData[0]._id },
          process.env.JWT_SECRET_KEY,
          {}
        );
        await registerModel.findByIdAndUpdate(
          {
            _id: userData[0]._id,
          },
          {
            version: version,
          },
          { new: true }
        );
        let response = {
          userId: userData[0]._id,
          firstname: userData[0].firstname,
          lastname: userData[0].lastname,
          username: userData[0].username,
          organization: userData[0].organization,
          email: userData[0].email,
          countryCode: userData[0].countryCode,
          phone: userData[0].phone,
          zipcode: userData[0].zipcode,
          gender: userData[0].gender,
          version: userData[0].version,
          image: userData[0].image,
          token,
        };
        if (deviceData.length > 0) {
          await deviceModel.findByIdAndUpdate(
            {
              _id: deviceData[0]._id,
            },
            { userId: userData[0]._id },
            { new: true }
          );
        } else {
          let device_data = new deviceModel({
            userId: userData[0]._id,
            deviceId,
            deviceType,
            deviceToken,
          });
          await device_data.save();
        }
        return res.json({
          success: "true",
          data: response,
          message: "Login successfully",
        });
      } else {
        return res.json({
          success: "false",
          data: {},
          message: "Invalid credentials ",
        });
      }
    } else {
      return res.json({
        success: "false",
        data: {},
        message: "Invalid credentials ",
      });
    }
  } catch (error) {
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.forgotEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let response = {
      success: "false",
      data: {},
      message: errors.array()[0].msg,
    };
    return res.send(response);
  }
  try {
    let { email } = req.body;
    let userData = await registerModel.find({ email });
    if (userData.length > 0) {
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("view"),
          defaultLayout: false,
        },
        viewPath: path.resolve("view"),
      };
      transporter.use("compile", hbss(handlebarOptions));
      let OTPP = Math.floor(1000 + Math.random() * 9000);
      OTPP = parseInt(OTPP);
      await registerModel.findByIdAndUpdate(
        { _id: userData[0]._id },
        { otp: OTPP },
        { new: true }
      );
      let mail = decryption(email);
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
          const result = {
            success: "false",
            data: {},
            message: error,
          };
          return res.send(result);
        } else {
          const otpsent = {
            success: "true",
            data: {},
            message: "Email send successfully",
          };
          return res.send(otpsent);
        }
      });
    } else {
      return res.json({
        success: "false",
        data: {},
        message: "Email does not exist",
      });
    }
  } catch (error) {
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let response = {
      success: "false",
      data: {},
      message: errors.array()[0].msg,
    };
    return res.send(response);
  }
  try {
    let { otp, email } = req.body;
    let userData = await registerModel.find({ email });
    if (userData.length > 0) {
      if (otp == userData[0].otp) {
        return res.json({
          success: "true",
          data: {},
          message: "OTP match successfully",
        });
      } else {
        return res.json({
          success: "false",
          data: {},
          message: "OTP does not match",
        });
      }
    } else {
      return res.json({
        success: "false",
        data: {},
        message: "Email does not exist",
      });
    }
  } catch (error) {
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let response = {
      success: "false",
      data: {},
      message: errors.array()[0].msg,
    };
    return res.send(response);
  }
  try {
    let { email, password } = req.body;
    let userData = await registerModel.find({ email });
    if (userData.length > 0) {
      await registerModel.findOneAndUpdate(
        { email: email },
        { password: password },
        { new: true }
      );
      return res.json({
        success: "true",
        data: {},
        message: "Password updated successfully",
      });
    } else {
      return res.json({
        success: "false",
        data: {},
        message: "Email does not exist",
      });
    }
  } catch (error) {
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.logout = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let response = {
      success: "false",
      data: {},
      message: errors.array()[0].msg,
    };
    return res.send(response);
  }
  try {
    let token = req.headers.authorization.split(" ")[1];
    const validToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    let _id = validToken._id;
    let { deviceId, deviceType, deviceToken } = req.body;

    await deviceModel.findOneAndDelete({
      userId: _id,
      deviceId: deviceId,
      deviceType: deviceType,
      deviceToken: deviceToken,
    });
    return res.json({
      success: "true",
      data: {},
      message: "Logout successfully",
    });
  } catch (error) {
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    const validToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    let _id = validToken._id;
    let userData = await registerModel.find({ _id });
    console.log(userData);
    let image;
    if (userData[0].image != null) {
      image = decryption(userData[0].image);
      let path = `http://localhost:4050/assets/images/userImage/`;
      let concatImage = path + image;
      image = encryption(concatImage);
    }
    let response = {
      firstname: userData[0].firstname,
      lastname: userData[0].lastname,
      username: userData[0].username,
      organization: userData[0].organization,
      image: image,
      totalGroup: 0,
      peopleOnline: 0,
      peoplePraying: 0,
    };
    return res.json({
      success: "true",
      data: response,
      message: "Data fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    const validToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    let _id = validToken._id;
    let userData = await registerModel.find({ _id: _id });
    let data = {
      deleted: 1,
      deleted_date: new Date(),
    };
    if (userData.length > 0) {
      await registerModel.findByIdAndUpdate({ _id }, data, { new: true });
    }

    return res.json({
      success: "true",
      data: {},
      message: "Your account will be deleted after 7 days",
    });
  } catch (error) {
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.deleteAccountData = async (req, res) => {
  try {
    const week = new Date();
    week.setDate(week.getDate() - 7);
    let user = await registerModel
      .find({ deleted_date: { $lt: week } })
      .select("_id");

    let deleteData = [];
    user.forEach((element) => {
      deleteData.push(element._id);
    });

    return res.json({
      success: "true",
      data: {},
      message: "successfully deleted",
    });
  } catch (error) {
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let response = {
      success: "false",
      data: {},
      message: errors.array()[0].msg,
    };
    return res.send(response);
  }
  try {
    let token = req.headers.authorization.split(" ")[1];
    const validToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    let _id = validToken._id;
    let { oldPass, newPass } = req.body;
    let data = await registerModel.find({ _id });
    let dbPassword = data[0].password;
    if (dbPassword != oldPass) {
      return res.json({
        success: "false",
        data: {},
        message: "Current password does not match",
      });
    } else {
      await registerModel.findByIdAndUpdate(
        {
          _id: _id,
        },
        { $set: { password: newPass } },
        { new: true }
      );
      return res.json({
        success: "true",
        data: {},
        message: "Password updated successfully",
      });
    }
  } catch (error) {
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let response = {
      success: "false",
      data: {},
      message: errors.array()[0].msg,
    };
    return res.send(response);
  }
  try {
    let token = req.headers.authorization.split(" ")[1];
    const validToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    let _id = validToken._id;
    let {
      fullname,
      countryCode,
      phone,
      zipcode,
      gender,
      country,
      website,
      instagram,
      facebook,
      linkedIn,
    } = req.body;
    let userData = await registerModel.find({ _id });

    let imgpath;
    if (!req.files["image"]) {
      imgpath = userData[0].image;
    } else {
      imgpath = encryption(req.files["image"][0].filename);
    }
    let coverImage;
    if (!req.files["coverImage"]) {
      coverImage = userData[0].coverImage;
    } else {
      coverImage = encryption(req.files["coverImage"][0].filename);
    }

    const obj = {
      fullname: fullname,
      countryCode: countryCode,
      phone: phone,
      zipcode: zipcode,
      gender: gender,
      country: country,
      website: website,
      instagram: instagram,
      facebook: facebook,
      linkedIn: linkedIn,
      image: imgpath,
      coverImage: coverImage,
    };
    let updateuser = await registerModel.findByIdAndUpdate({ _id: _id }, obj, {
      new: true,
    });
    let image;
    if (updateuser.image != null) {
      image = decryption(updateuser.image);
      let path = `http://localhost:4050/assets/images/userImage/`;
      let concatImage = path + image;
      image = encryption(concatImage);
    }
    let cprofile;
    if (updateuser.coverImage != null) {
      cprofile = decryption(updateuser.coverImage);
      let path = `http://localhost:4050/assets/images/userImage/`;
      let concatImage = path + cprofile;
      cprofile = encryption(concatImage);
    }

    let response = {
      userid: updateuser._id,
      firstname: updateuser.firstname,
      lastname: updateuser.lastname,
      username: updateuser.username,
      organization: updateuser.organization,
      countryCode: updateuser.countryCode,
      phone: updateuser.phone,
      zipcode: updateuser.zipcode,
      gender: updateuser.gender,
      country: updateuser.country,
      website: updateuser.website,
      instagram: updateuser.instagram,
      facebook: updateuser.facebook,
      linkedIn: updateuser.linkedIn,
      image: image,
      coverImage: cprofile,
    };
    return res.json({
      success: "true",
      data: response,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};

exports.usergetProfile = async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    const validToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    let _id = validToken._id;
    let userData = await registerModel.findOne({ _id });
    let image;
    if (userData.image != null) {
      image = decryption(userData.image);
      let path = `http://localhost:4050/assets/images/userImage/`;
      let concatImage = path + image;
      image = encryption(concatImage);
    }
    let coverImage;
    if (userData.coverImage != null) {
      coverImage = decryption(userData.coverImage);
      let path = `http://localhost:4050/assets/images/userImage/`;
      let concatImage = path + coverImage;
      coverImage = encryption(concatImage);
    }
    let response = {
      firstname: userData.firstname,
      lastname: userData.lastname,
      username: userData.username,
      organization: userData.organization,
      email: userData.email,
      following: 0,
      follower: 0,
      countryCode: userData.countryCode,
      phone: userData.phone,
      gender: userData.gender,
      country: userData.country,
      website: userData.website,
      instagram: userData.instagram,
      facebook: userData.facebook,
      linkedIn: userData.linkedIn,
      image: image,
      coverImage: coverImage,
    };
    return res.json({
      success: "true",
      data: response,
      message: "user data fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};
