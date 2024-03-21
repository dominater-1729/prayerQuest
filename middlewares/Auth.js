const adminModel = require("../models/admin");

const isAuth = async (req, res, next) => {
  if (req.session.isAuth) {
    const adminData = await adminModel.findById({ _id: req.session.admin });
    res.locals.adminData = adminData;
    console.log({ isAuthdata: req.session.isAuth });
    next();
  } else {
    res.redirect("/ADMIN/login");
  }
};

module.exports = isAuth;