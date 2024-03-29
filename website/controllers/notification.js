const { validationResult } = require("express-validator");
const notificationModel = require("../../models/notification");
const userModel = require("../../models/user")
const encryption = require("../../helpers/encryptData");
const notification = require("../../models/notification");


exports.createNotification = async (req, res) => {
    try {

        return res.redirect("back");
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

exports.listNotification = async (req, res) => {
    try {
        const userId = (req.session.user);
        await userModel.aggregate([
            {
                $match: { _id: userId },
            },
            {
                $sort: { _id: userId }
            }
        ])
        const { notification } = await userModel.findById(userId).populate('notification').sort({ createdAt: -1 });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
}

