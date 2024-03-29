const { validationResult } = require("express-validator");
const userModel = require("../../models/user");
const encryption = require("../../helpers/encryptData");

exports.memeberList = async (req, res) => {
    try {
        const comments = await commentModel.create();
        comments.forEach(comment => {
            comment.comment = encryption(comment.comment);
            comment.media = encryption(comment.media);
        })
        return res.redirect("back");
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};