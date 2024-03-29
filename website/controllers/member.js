const { validationResult } = require("express-validator");
const userModel = require("../../models/user");
const encryption = require("../../helpers/encryptData");

exports.memeberList = async (req, res) => {
    try {
        const users = await userModel.create();
        return res.redirect("back");
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};