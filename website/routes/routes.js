const express = require("express");
const router = express.Router();
const multer = require("multer");
const { body } = require("express-validator");
const valid = require("../../middlewares/validationCheck");
const userAuth = require("../../middlewares/userAuth");
const loginController = require("../controllers/login");
const dashboardController = require("../controllers/dashboard");
const aboutController = require("../controllers/about");
const donateController = require("../controllers/donation");
const accountController = require("../controllers/account");
const favoriteController = require("../controllers/favorite");
const membershipController = require("../controllers/membership");
const inspirationController = require("../controllers/inspiration");
const originalController = require("../controllers/originals");
const circleController = require("../controllers/prayerCircle");
const prayerController = require("../controllers/prayer");
const prayerMiracleController = require("../controllers/prayerMiracle");
const publicController = require("../controllers/publicSquare");
const videosController = require("../controllers/videos");
const commentsController = require('../controllers/comments')
const compressMiddleware = require('../middlewares/compress')

//multer
const userProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/images/userImage");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.compressMiddlewaresplit("/")[1];
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

//for prayer
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

//credentials
router.get("/login", loginController.login);
router.post(
  "/login",
  [
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
    body("password")
      .notEmpty()
      .withMessage("Please enter password")
      .escape()
      .trim(),
  ],
  loginController.userLogin
);
router.get("/signup", loginController.register);
router.post(
  "/signup",
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
    body("password")
      .notEmpty()
      .withMessage("Please enter password")
      .escape()
      .trim(),
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
  ],
  loginController.signup
);
router.get("/otp", loginController.otp);
router.post(
  "/verifyOtp",
  [
    body("otp1").notEmpty().withMessage("Please enter otp").escape().trim(),
    body("otp2").notEmpty().withMessage("Please enter otp").escape().trim(),
    body("otp3").notEmpty().withMessage("Please enter otp").escape().trim(),
    body("otp4").notEmpty().withMessage("Please enter otp").escape().trim(),
  ],
  loginController.verifyOtp
);
router.get("/forgotpass", loginController.forgotPass);
router.get("/resetpass", loginController.resetPass);
router.post(
  "/resetpass",
  [body("email").notEmpty().withMessage("Please enter email").escape().trim()],
  loginController.sendOtp
);

router.post("/updatePass", loginController.updatePass);

router.get("/success", loginController.successpassword);
router.get("/logout", loginController.logout);

//dashboard
router.get("/dashboard", userAuth, dashboardController.dashboard);

//about
router.get("/about", aboutController.about);

//donate
router.get("/donate", donateController.donate);

//account
router.get("/contact", userAuth, accountController.contact);
router.post(
  "/sendQuery/:id",
  [
    body("fullname")
      .notEmpty()
      .withMessage("Please enter fullname")
      .escape()
      .trim(),
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
    body("message")
      .notEmpty()
      .withMessage("Please enter message")
      .escape()
      .trim(),
  ],
  accountController.sendQuery
);
router.get("/privacy", accountController.privacy);
router.get("/terms", accountController.terms);
router.get("/changePass", userAuth, accountController.changePass);
router.post(
  "/changePass/:id",
  [
    body("opass")
      .notEmpty()
      .withMessage("Please enter old password")
      .escape()
      .trim(),
    body("npass")
      .notEmpty()
      .withMessage("Please enter new password")
      .escape()
      .trim(),
  ],
  accountController.updatePass
);
router.get("/profile", userAuth, accountController.profile);
router.post(
  "/socialLinks/:id",
  [
    body("instagram")
      .notEmpty()
      .withMessage("Please enter instagram link")
      .escape()
      .trim(),
    body("facebook")
      .notEmpty()
      .withMessage("Please enter facebook link")
      .escape()
      .trim(),
    body("linkedIn")
      .notEmpty()
      .withMessage("Please enter linkedIn link")
      .escape()
      .trim(),
  ],
  accountController.updateSocialLinks
);

router.post(
  "/editProfile/:id",
  userImage.fields([
    { name: "userImage", maxCount: 1 },
    { name: "cprofile", minCount: 1 },
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
  ],
  accountController.updateProfile
);

router.get("/faqs", accountController.faqs);
router.get("/followProfile", accountController.followProfile);
router.get("/works", accountController.work);

//favorite
router.get("/favorite", favoriteController.favorite);

//membership
router.get("/membership", membershipController.membership);

//inspiration
router.get("/inspiration", inspirationController.inspirationQuotes);

//original prayer listing
router.get("/originalPrayer", originalController.originalListing);
router.get("/originalDetails", originalController.originalDetails);

//prayer circle
router.get("/prayerCircle", userAuth, circleController.prayerCircle);
router.get("/createGroup", userAuth, circleController.createGroup);
router.post(
  "/createGroup/:id",
  groupImage.single("groupImage"),
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
  circleController.createCircleGroup
);
router.get("/privateGroup", circleController.privateGroup);
router.get("/privateGroup", circleController.privateGroup);
router.get("/privateStaticGroup", circleController.privateStaticGroup);
router.get("/members", circleController.groupMembers);

//prayer
router.get("/prayers", prayerController.prayer);

//prayerMiracle
router.get("/prayerMiracle", prayerMiracleController.prayerMiracle);
router.get(
  "/prayerMiracleDetails",
  prayerMiracleController.prayerMiracleDetails
);

//publicSquare
router.get("/publicSquare", userAuth, publicController.public);
router.get("/createPrayer", userAuth, publicController.createPrayer);
router.post(
  "/addPrayer/:groupId",
  prayerImage.single("prayerImage"),
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
  ],
  publicController.addPrayer
);
router.get("/squareDetails/:id", userAuth, publicController.squareDetails);
router.get("/squareDetailsStats", publicController.squareDetailsStats);

//videos
router.get("/videos", videosController.videos);
router.get("/videoDetails", videosController.videoDetails);

// comments
router.post("/comments/:id", prayerImage.single("commentImage"), compressMiddleware, userAuth, [
  body("comment").notEmpty().withMessage("Please enter comment").trim(),
], commentsController.createComment);

router.get("/comments", userAuth, commentsController.getComments);

router.get("/comments/:id", userAuth, commentsController.getComment);

router.patch("/comments/:id", userAuth, [
  body("comment").notEmpty().withMessage("Please enter comment").escape().trim(),
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
], commentsController.updateComment);

router.delete("/comments/:id", userAuth, commentsController.deleteComment);

module.exports = router;
