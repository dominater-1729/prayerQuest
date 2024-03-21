const { validationResult } = require("express-validator");
let mongoose = require("mongoose");
let Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
let decryption = require("../../helpers/decryptData.js");
let encryption = require("../../helpers/encryptData.js");
let prayerModel = require("../../models/prayer");

function timeAgo(timestamp) {
  const currentDate = new Date();
  const previousDate = new Date(timestamp);

  const timeDifference = currentDate - previousDate;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (timeDifference < minute) {
    return Math.floor(timeDifference / 1000) + " seconds ago";
  } else if (timeDifference < hour) {
    return Math.floor(timeDifference / minute) + " minutes ago";
  } else if (timeDifference < day) {
    return Math.floor(timeDifference / hour) + " hours ago";
  } else if (timeDifference < month) {
    return Math.floor(timeDifference / day) + " days ago";
  } else if (timeDifference < year) {
    const months = Math.floor(timeDifference / month);
    return months + (months === 1 ? " month ago" : " months ago");
  } else {
    const years = Math.floor(timeDifference / year);
    return years + (years === 1 ? " year ago" : " years ago");
  }
}

exports.public = async (req, res) => {
  try {
    let id = req.session.user;
    let page_no = req.query.page_no || 1;
    let limit = 10;
    let skip = limit * page_no - limit;
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    let prayerdata = await prayerModel.aggregate([
      {
        $match: {
          $or: [{ prayerImage: { $ne: null } }, { prayerVideo: { $ne: null } }],
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: "$users",
      },
      {
        $project: {
          _id: 0,
          prayerId: "$_id",
          title: "$title",
          description: "$description",
          createdAt: "$createdAt",
          prayer: { $ifNull: ["$prayerImage", "$prayerVideo"] },
          userImage: "$users.image",
          userfirstname: "$users.firstname",
          userlastname: "$users.lastname",
          type: "$type",
        },
      },
      {
        $facet: {
          edges: [{ $skip: skip }, { $limit: limit }],
          pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
        },
      },
    ]);
    let result = [];
    let totalpage = 1;
    if (prayerdata[0].edges.length > 0) {
      result = prayerdata[0].edges;
      totalpage = prayerdata[0].pageInfo[0].count;
    }
    let pages = Math.ceil(totalpage / limit);
    result.map((time) => {
      time.createdAt = timeAgo(time.createdAt);
    });
    return res.render("../view/website/publicSquare/public.hbs", {
      id,
      successToast,
      errorToast,
      decryption,
      prayerdata: result,
      pagination: {
        page: page_no,
        pageCount: pages,
      },
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.createPrayer = async (req, res) => {
  try {
    let id = req.session.user;
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    let groupId = "65f2d389644ae6843b51f0eb";
    return res.render("../view/website/publicSquare/createPrayer.hbs", {
      id,
      successToast,
      errorToast,
      groupId,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.addPrayer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let userId = req.session.user;
    let groupId = req.params.groupId;
    let { title, postType, description } = req.body;
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
      res.cookie("errorToast", "Please enter image or video", { maxAge: 3000 });
      res.redirect("back");
    }

    let data = new prayerModel({
      userId: userId,
      groupId: groupId,
      title: encryption(title),
      postType: encryption(postType),
      description: encryption(description),
      prayerImage: prayerImage,
      prayerVideo: prayerVideo,
      type: type,
    });
    await data.save();
    res.cookie("successToast", "Prayer added successfully", { maxAge: 3000 });
    return res.redirect("/website/publicSquare");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.squareDetails = async (req, res) => {
  try {
    let prayerId = req.params.id;
    let prayerData = await prayerModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(prayerId),
          $or: [{ prayerImage: { $ne: null } }, { prayerVideo: { $ne: null } }],
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'prayerId',
          as: 'comments'
        }
      },
      {
        $unwind: '$comments'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'comments.userId',
          foreignField: '_id',
          as: 'commentedBy'
        }
      },
      {
        $unwind: '$commentedBy'
      },
      {
        $project: {
          _id: 0,
          prayerid: "$_id",
          title: "$title",
          description: "$description",
          createdAt: "$createdAt",
          prayer: { $ifNull: ["$prayerImage", "$prayerVideo"] },
          type: "$type",
          comment: { comment: '$comments.comment', by: '$commentedBy.firstname' },
          commentedBy: 1
        },
      },
      {
        $group: {
          _id: '$prayerid',
          comments: {
            $push: '$comment'
          },
          prayerid: { $first: '$prayerid' },
          title: { $first: '$title' },
          description: { $first: '$description' },
          createdAt: { $first: '$createdAt' },
          prayer: { $first: '$prayer' },
          type: { $first: '$type' },
        }
      }
    ]);


    prayerData.map((item) => {
      item.createdAt = timeAgo(item.createdAt);
    });

    prayerData = prayerData[0];

    prayerData.comments.map((item) => {
      item.comment = decryption(item.comment)
      item.by = decryption(item.by);
    })

    return res.render("../view/website/publicSquare/squareDetails.hbs", {
      decryption,
      prayerData,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.squareDetailsStats = async (req, res) => {
  try {
    return res.render("../view/website/publicSquare/squareDetailsStats.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};
