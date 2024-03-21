const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
let encryption = require("../../helpers/encryptData");
let decryption = require("../../helpers/decryptData");
const path = require("path");

//models
let circleModel = require("../../models/circlePrayer");
let prayerModel = require("../../models/prayer");

exports.createCircleGroup = async (req, res) => {
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
    let { groupName, description } = req.body;
    let groupImage;
    console.log(req.file);

    if (req.file) {
      console.log(req.file.filename);
      groupImage = encryption(req.file.filename);
    }
    let data = new circleModel({
      userId: _id,
      groupImage: groupImage,
      groupName: encryption(groupName),
      description: encryption(description),
    });
    let groupdata = await data.save();
    console.log(groupdata);
    let image;
    if (groupdata.groupImage) {
      let path = "http://localhost:4050/assets/images/groupImage/";
      image = decryption(groupdata.groupImage);
      let concatImage = path + image;
      image = encryption(concatImage);
    }
    let response = {
      groupId: groupdata._id,
      groupName: groupdata.groupName,
      description: groupdata.description,
      groupImage: image,
    };
    return res.json({
      success: "true",
      data: response,
      message: "Group created successfully",
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

exports.addPrayer = async (req, res) => {
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
    let { groupId, title, postType, description } = req.body;
    let prayerImage;
    let prayerVideo;
    let type;
    if (req.file.mimetype.startsWith("image")) {
      prayerImage = encryption(req.file.filename);
      type = "image";
    }
    // Check if it's a video
    else if (req.file.mimetype.startsWith("video")) {
      prayerVideo = encryption(req.file.filename);
      type = "video";
    } else {
      return res.json({
        success: "false",
        data: {},
        message: "Please enter image or video",
      });
    }

    let data = new prayerModel({
      userId: _id,
      groupId: groupId,
      title: title,
      postType: postType,
      description: description,
      prayerImage: prayerImage,
      prayerVideo: prayerVideo,
      type: type,
    });
    let prayerData = await data.save();
    let prayer;
    if (prayerData.prayerImage != null) {
      let path = "http://localhost:4050/assets/images/prayer/";
      prayer = decryption(prayerData.prayerImage);
      let concatImage = path + prayer;
      prayer = encryption(concatImage);
    } else {
      let path = "http://localhost:4050/assets/images/prayer/";
      prayer = decryption(prayerData.prayerVideo);
      let concatImage = path + prayer;
      prayer = encryption(concatImage);
    }
    let response = {
      prayerId: prayerData._id,
      groupId: prayerData.groupId,
      userId: prayerData.userId,
      title: prayerData.title,
      postType: prayerData.postType,
      description: prayerData.description,
      prayer: prayer,
    };
    return res.json({
      success: "true",
      data: response,
      message: "Prayer added successfully",
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
