const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
let userModel = require("../../models/user");
let circleModel = require("../../models/circlePrayer");
let decryption = require("../../helpers/decryptData.js");
let encryption = require("../../helpers/encryptData.js");
const searchOptions = require("../../helpers/searchOptions.js")

const { countDays, timeAgo, createNotification } = require("../../helpers/common.js");

const perGroupUserPrayerCircleData = async ({ userId, limit, skip, sort }) => {
  let prayerCircleDataQuery = circleModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "users",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "admin",
        foreignField: "_id",
        as: "users",
      },
    },
    {
      $addFields: {
        isMember: {
          $cond: [{ $in: [userId, '$users'] }, true, false]
        },
        isRequested: {
          $cond: [{ $in: [userId, '$pending'] }, true, false]
        },
        isAdmin: {
          $cond: [{ $eq: [userId, '$admin'] }, true, false]
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        let: { members: '$members' },
        pipeline: [{
          $group: {
            _id: null,
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            nonMembers: { $setDifference: ['$ids', '$$members'] }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'nonMembers',
            foreignField: '_id',
            as: 'nonMembers'
          }
        },
        ],
        as: 'trial'
      }
    },
    {
      $project: {
        admin: 1,
        groupImage: 1,
        groupName: 1,
        description: 1,
        members: 1,
        createdAt: 1,
        isMember: 1,
        isRequested: 1,
        isAdmin: 1,
        trial: 1,
      }
    }
  ]);

  prayerCircleDataQuery = prayerCircleDataQuery.limit(limit).skip(skip);

  const prayerCircleData = await prayerCircleDataQuery;

  let data = [];

  prayerCircleData.map(data => {
    console.log("data", data)
    data.groupAge = timeAgo(data.createdAt);
    data.nonMembers = data.trial[0].nonMembers;
  })

  console.log(prayerCircleData);

  return prayerCircleData;
}

exports.prayerCircle = async (req, res) => {

  console.log("deleted data form prayer circle");

  try {
    const { successToast, errorToast } = req.cookies || {};
    let userId = new mongoose.Types.ObjectId(req.session.user);
    // const prayerCircleData = await circleModel.find().populate('admin').populate('members');
    const prayerCircleData = await circleModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "admin",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $addFields: {
          isMember: {
            $cond: [{ $in: [userId, '$users'] }, true, false]
          },
          isRequested: {
            $cond: [{ $in: [userId, '$pending'] }, true, false]
          },
          isAdmin: {
            $cond: [{ $eq: [userId, '$admin'] }, true, false]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { members: '$members' },
          pipeline: [{
            $group: {
              _id: null,
              ids: { $push: '$_id' },
            },
          },
          {
            $project: {
              nonMembers: { $setDifference: ['$ids', '$$members'] }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'nonMembers',
              foreignField: '_id',
              as: 'nonMembers'
            }
          },
          ],
          as: 'trial'
        }
      },
      {
        $project: {
          admin: 1,
          groupImage: 1,
          groupName: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          isMember: 1,
          isRequested: 1,
          isAdmin: 1,
          trial: 1,
        }
      }
    ]);


    prayerCircleData.map(data => {
      data.groupAge = timeAgo(data.createdAt);
      data.nonMembers = data.trial[0].nonMembers;
    })

    console.log("prayerCircleData", prayerCircleData);
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/prayerCircle/prayerCircle.hbs", {
      successToast,
      errorToast,
      prayerCircleData,
      decryption
    });



  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.listNonMembers = async (req, res) => {

  try {
    const { successToast, errorToast } = req.cookies || {};
    let userId = new mongoose.Types.ObjectId(req.session.user);
    const groupId = new mongoose.Types.ObjectId(req.params.groupId);
    // const prayerCircleData = await circleModel.find().populate('admin').populate('members');
    const prayerCircleData = await circleModel.aggregate([
      {
        $match: {
          _id: groupId
        }
      },
      {
        $lookup: {
          from: 'users',
          // let: { members: { $concatArrays: ['$members', '$pending'] } },
          let: { members: '$members', pending: '$pending' },
          pipeline: [
            {
              $group: {
                _id: null,
                ids: { $push: '$_id' },
              },
            },
            {
              $project: {
                nonMembers: { $setDifference: ['$ids', '$$members'] }
              }
            },
            {
              $project: {
                nonMembers: { $filter: { input: "$nonMembers", as: "item", cond: { $ne: ["$$item", userId] } } }
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'nonMembers',
                foreignField: '_id',
                as: 'nonMembers'
              }
            },
          ],
          as: 'trial'
        }
      },
      {
        $project: {
          trial: 1,
          pending: 1
        }
      }
    ]);

    const data = prayerCircleData[0].trial[0].nonMembers;

    let main = [];

    data?.forEach((el) => {
      if (el.image) el.image = decryption(el.image);
      main.push({ name: `${decryption(el.firstname)} ${decryption(el.lastname)} `, image: el.image, id: el._id })
    })



    console.log("main", main)

    console.log("prayerCircleData", main.length);
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    res.status(200).send(main)
    // return ;

  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.listMembers = async (req, res) => {

  try {
    const { successToast, errorToast } = req.cookies || {};
    let userId = new mongoose.Types.ObjectId(req.session.user);
    const groupId = new mongoose.Types.ObjectId(req.params.groupId);
    console.log(groupId);
    // const prayerCircleData = await circleModel.find().populate('admin').populate('members');

    const { admin, members, groupImage } = await circleModel.findById(groupId)
      .populate({ path: 'admin', select: 'firstname lastname image' })
      .populate({ path: 'members', select: 'firstname lastname image' })

    console.log("privateGroupData", members);
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    res.render('../view/website/prayerCircle/members.hbs', {
      admin, members, groupImage, decryption
    })
    // return ;

  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.createGroup = async (req, res) => {
  try {
    let id = req.session.user;
    const { successToast, errorToast } = req.cookies || {};
    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/prayerCircle/createGroup.hbs", {
      id,
      successToast,
      errorToast,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.JoinGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.session.user);

    const data = await circleModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(groupId) },
      },
      {
        $addFields: {
          isMember: {
            $cond: [{ $in: [userId, '$members'] }, true, false]
          },
          isRequested: {
            $cond: [{ $in: [userId, '$pending'] }, true, false]
          },
          isAdmin: {
            $cond: [{ $eq: [userId, '$admin'] }, true, false]
          }
        }
      },
    ])

    const { isAdmin, isMember, isRequested } = data[0];

    console.log(isRequested);

    if (!isAdmin && !isMember && !isRequested) {

      // send notification to group admin

      const notification = await createNotification({ to: data[0].admin, type: 'Group', description: 'Member Request', link: '/circle-group/:groupId' });
      await userModel.findByIdAndUpdate(data[0].admin, { $push: { notification: notification._id } });
      const group = await circleModel.findByIdAndUpdate(groupId, { $push: { pending: userId } }, { new: true });
    }
    return res.redirect(`/website/privateGroup/${groupId}`);
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
}

exports.InviteGroup = async (req, res, next) => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.groupId);
    const to = new mongoose.Types.ObjectId(req.params.userId);

    const data = await circleModel.aggregate([{
      $match: { _id: groupId },
    },
    {
      $addFields: {
        isMember: {
          $cond: [{ $in: [to, '$members'] }, true, false]
        },
        isRequested: {
          $cond: [{ $in: [to, '$pending'] }, true, false]
        },
        isAdmin: {
          $cond: [{ $eq: [to, '$admin'] }, true, false]
        }
      }
    },
    ])

    const { isAdmin, isMember, isRequested } = data[0];

    if (!isAdmin && !isMember && !isRequested) {

      const notification = await createNotification({ to, type: 'Group', description: 'Invite', link: '/circle-group/:groupId' });

      const user = await userModel.findByIdAndUpdate(to, { $push: { notification: notification._id } });
    }

    console.log(data);

    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    res.cookie("successToast", "Invited successfully", { maxAge: 3000 })
    res.redirect("/website/prayerCircle")
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
}

exports.addMemberToGroup = async (req, res, next) => {
  try {
    const { userId, groupId, isJoined } = req.params;
    if (isJoined)
      await circleModel.findByIdAndUpdate(groupId, {
        $pull: { pending: userId },
        $pull: { members: userId }
      }, { new: true });
    else await circleModel.findByIdAndUpdate(groupId, {
      $pull: { pending: userId, },
    }, { new: true });

    res.clearCookie("successToast");
    res.clearCookie("errorToast");
    return res.render("../view/website/prayerCircle/prayerCircle.hbs", {
      successToast,
      errorToast,
      prayerCircleData,
      decryption
    });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
}

exports.createCircleGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("user login", errors);
    return res.redirect("back");
  }
  try {
    let id = req.params.id;
    let { groupName, description } = req.body;
    let groupImage;
    if (req.file) {
      groupImage = encryption(req.file.filename);
    }
    let data = new circleModel({
      admin: id,
      groupImage: groupImage,
      groupName: encryption(groupName),
      description: encryption(description),
    });
    await data.save();
    res.cookie("successToast", "Group created successfully", { maxAge: 3000 });
    return res.redirect("/website/prayerCircle");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.privateGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.session.user;

    const privateGroupData = await circleModel.findById(groupId);
    privateGroupData.groupAge = timeAgo(privateGroupData.createdAt);
    privateGroupData.isMember = privateGroupData.members.includes(userId);
    privateGroupData.isAdmin = privateGroupData.admin == userId;
    privateGroupData.isRequested = privateGroupData.pending.includes(userId);
    console.log(privateGroupData.isAdmin, privateGroupData.isMember);
    if (privateGroupData.isAdmin || privateGroupData.isMember)
      return res.render("../view/website/prayerCircle/publicGroup.hbs", {
        privateGroupData,
        decryption
      });
    else
      return res.render("../view/website/prayerCircle/privateGroup.hbs", {
        privateGroupData,
        decryption
      });
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.listGroups = async ({ query, userId }) => {
  try {
    let data = [];
    // userId = null;
    if (userId)
      data = await perGroupUserPrayerCircleData({ userId, ...query });
    else data = await circleModel.find(userId, null, query);
    return data;
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
}

exports.privateStaticGroup = async (req, res) => {
  try {
    return res.render("../view/website/prayerCircle/privateGroupStatic.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

exports.groupMembers = async (req, res) => {
  try {
    return res.render("../view/website/prayerCircle/members.hbs");
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};