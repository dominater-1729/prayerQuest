const express = require("express");
const router = express.Router();
const multer = require("multer");
const { body } = require("express-validator");
const valid = require("../../middlewares/validationCheck");
const registerController = require("../controllers/registerController");
const prayerCircleController = require("../controllers/prayerCircle");

router.post("/encKeys", registerController.encKeys);
router.post("/encrypt", registerController.encryptData);
router.post("/decrypt", registerController.decryptData);

//multer
const userProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/images/userImage");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `image-${Date.now()}.${ext}`);
  },
});
const userImage = multer({ storage: userProfile });

//for group image
const groupProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/images/groupImage");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `image-${Date.now()}.${ext}`);
  },
});
const groupImage = multer({ storage: groupProfile });

const prayerProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/images/prayer");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `image-${Date.now()}.${ext}`);
  },
});
const prayerImage = multer({ storage: prayerProfile });

router.post(
  "/userRegister",
  [
    body("firstname")
      .notEmpty()
      .withMessage("Please enter firstname")
      .escape()
      .trim(),
    body("lastname")
      .notEmpty()
      .withMessage("Please enter lastname")
      .escape()
      .trim(),
    body("username")
      .notEmpty()
      .withMessage("Please enter username")
      .escape()
      .trim(),
    body("organization")
      .notEmpty()
      .withMessage("Please enter organization")
      .escape()
      .trim(),
    body("countryCode").optional().escape().trim(),
    body("phone").optional().escape().trim(),
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
    body("gender")
      .notEmpty()
      .withMessage("Please enter gender")
      .escape()
      .trim(),
    body("zipcode")
      .notEmpty()
      .withMessage("Please enter zipcode")
      .escape()
      .trim(),
    body("password")
      .notEmpty()
      .withMessage("Please enter password")
      .escape()
      .trim(),
    body("deviceId")
      .notEmpty()
      .withMessage("Please enter device Id")
      .escape()
      .trim(),
    body("deviceToken")
      .notEmpty()
      .withMessage("Please enter device token")
      .escape()
      .trim(),
    body("deviceType")
      .notEmpty()
      .withMessage("Please enter device type")
      .isIn([
        "Q05aZGJ4NE16bFpkRnFncjZBUlFMUT09",
        "Q2tDdm5GR2RhaWZCYVVFTjNldzBDdz09",
      ])
      .withMessage("Please select android and ios"),
    body("version")
      .notEmpty()
      .withMessage("Please enter version")
      .escape()
      .trim(),
  ],
  registerController.userRegister
);

router.post(
  "/userLogin",
  [
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
    body("password")
      .notEmpty()
      .withMessage("Please enter password")
      .escape()
      .trim(),
    body("deviceId")
      .notEmpty()
      .withMessage("Please enter device Id")
      .escape()
      .trim(),
    body("deviceToken")
      .notEmpty()
      .withMessage("Please enter device token")
      .escape()
      .trim(),
    body("deviceType")
      .notEmpty()
      .withMessage("Please enter device type")
      .isIn([
        "Q05aZGJ4NE16bFpkRnFncjZBUlFMUT09",
        "Q2tDdm5GR2RhaWZCYVVFTjNldzBDdz09",
      ])
      .withMessage("Please select android and ios"),
    body("version")
      .notEmpty()
      .withMessage("Please enter version")
      .escape()
      .trim(),
  ],
  registerController.userLogin
);

router.post(
  "/sendOtp",
  [body("email").notEmpty().withMessage("Please enter email").escape().trim()],
  registerController.forgotEmail
);

router.post(
  "/verifyOtp",
  [
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
    body("otp").notEmpty().withMessage("Please enter Otp").escape().trim(),
  ],
  registerController.verifyOtp
);

router.post(
  "/updatePassword",
  [
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
    body("password")
      .notEmpty()
      .withMessage("Please enter password")
      .escape()
      .trim(),
  ],
  registerController.updatePassword
);

router.post(
  "/logout",
  valid.tokenCheck,
  [
    body("deviceId")
      .notEmpty()
      .withMessage("Please enter device id")
      .escape()
      .trim(),
    body("deviceType")
      .notEmpty()
      .withMessage("Please enter device type")
      .isIn([
        "Q05aZGJ4NE16bFpkRnFncjZBUlFMUT09",
        "Q2tDdm5GR2RhaWZCYVVFTjNldzBDdz09",
      ])
      .withMessage("Please select android and ios"),
    body("deviceToken")
      .notEmpty()
      .withMessage("Please enter device token")
      .escape()
      .trim(),
  ],
  valid.validationCheck,
  registerController.logout
);

router.post(
  "/getProfile",
  valid.tokenCheck,
  valid.validationCheck,
  registerController.getProfile
);

router.post(
  "/deleteUserAcc",
  valid.tokenCheck,
  registerController.deleteAccount
);

router.get("/deleteAccountData", registerController.deleteAccountData);

router.post(
  "/changePassword",
  valid.tokenCheck,
  [
    body("oldPass")
      .notEmpty()
      .withMessage("Please enter old password")
      .escape()
      .trim(),
    body("newPass")
      .notEmpty()
      .withMessage("Please enter new password")
      .escape()
      .trim(),
  ],
  valid.validationCheck,
  registerController.changePassword
);

router.post(
  "/updateProfile",
  valid.tokenCheck,
  userImage.fields([
    { name: "image", maxCount: 1 },
    { name: "coverImage", minCount: 1 },
  ]),

  [
    body("firstname")
      .notEmpty()
      .withMessage("Please enter firstname")
      .escape()
      .trim(),
    body("lastname")
      .notEmpty()
      .withMessage("Please enter lastname")
      .escape()
      .trim(),
    body("username")
      .notEmpty()
      .withMessage("Please enter username")
      .escape()
      .trim(),
    body("organization")
      .notEmpty()
      .withMessage("Please enter organization")
      .escape()
      .trim(),
    body("countryCode")
      .notEmpty()
      .withMessage("Please enter country code")
      .escape()
      .trim(),
    body("phone").notEmpty().withMessage("Please enter phone").escape().trim(),
    body("zipcode")
      .notEmpty()
      .withMessage("Please enter zipcode")
      .escape()
      .trim(),
    body("gender")
      .notEmpty()
      .withMessage("Please enter gender")
      .escape()
      .trim(),
    body("country")
      .notEmpty()
      .withMessage("Please enter country")
      .escape()
      .trim(),
    body("website")
      .notEmpty()
      .withMessage("Please enter website")
      .escape()
      .trim(),
    body("instagram").optional().escape().trim(),
    body("facebook").optional().escape().trim(),
    body("linkedIn").optional().escape().trim(),
  ],
  valid.validationCheck,
  registerController.updateProfile
);

router.post(
  "/usergetProfile",
  valid.tokenCheck,
  valid.validationCheck,
  registerController.usergetProfile
);

router.post(
  "/createGroup",
  groupImage.single("groupImage"),
  valid.tokenCheck,
  [
    body("groupName")
      .notEmpty()
      .withMessage("Please enter group name")
      .escape()
      .trim(),
    body("description")
      .notEmpty()
      .withMessage("Please enter description")
      .escape()
      .trim(),
  ],
  valid.validationCheck,
  prayerCircleController.createCircleGroup
);

router.post(
  "/addPrayer",
  prayerImage.single("prayer"),
  valid.tokenCheck,
  [
    body("title").notEmpty().withMessage("Please enter title").escape().trim(),
    body("postType")
      .notEmpty()
      .withMessage("Please enter post type")
      .escape()
      .trim(),
    body("description")
      .notEmpty()
      .withMessage("Please enter description")
      .escape()
      .trim(),
    body("groupId")
      .notEmpty()
      .withMessage("Please enter groupId")
      .escape()
      .trim(),
  ],
  valid.validationCheck,
  prayerCircleController.addPrayer
);

module.exports = router;
