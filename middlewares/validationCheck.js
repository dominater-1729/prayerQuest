const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

exports.validationCheck = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let response = { success: "false", message: errors.array()[0].msg };
      return res.json(response);
    }
    // If validation passes, move on to the next middleware or route handler
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: "false", message: "Something went wrong" });
  }
};

exports.tokenCheck = async (req, res, next) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer") ||
      !req.headers.authorization.split(" ")[1]
    ) {
      let tokenNotFound = {
        success: "false",
        errorMessage: "Please provide bearer token",
      };
      return res.json(tokenNotFound);
    } else {
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
          return res.status(401).json({
            status: "false",
            code: 401,
            data: {},
            message: "Invalid AUTH Token",
          });
        } else {
          req.userData = decoded.id;
          next();
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: "false", message: "Something went wrong" });
  }
};
