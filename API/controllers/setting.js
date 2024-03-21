const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
let encryption = require("../../helpers/encryptData");
let decryption = require("../../helpers/decryptData");
const path = require("path");

const queryModel = require("../../models/queryMessage");

exports.sendQueryMessage = async (req, res) => {
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
  } catch (error) {
    console.log(error);
    return res.json({
      success: "false",
      data: {},
      message: "Something went wrong",
    });
  }
};
