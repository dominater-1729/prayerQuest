const userModel = require("../models/user");

const userAuth = async (req, res, next) => {

  if (req.session.userAuth) {
    const userData = await userModel.findById({ _id: req.session.user });
    console.log({userData})
    res.locals.userData = userData;
    next();
  } else {
    res.redirect("/website/login");
  }
};

module.exports = userAuth;
