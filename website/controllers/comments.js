const { validationResult } = require("express-validator");
const commentModel = require("../../models/comments");
const encryption = require("../../helpers/encryptData")

const validationError = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return true;
    }
    return false;
}

const mediaValidator = (req, res) => {
    let media = "", type = "";
    if (req.file && req.file.mimetype && req.file.mimetype.startsWith("image")) {
        media = encryption(req.file.filename);
        type = "image";
    }
    // Check if it's a video
    else if (req.file && req.file.mimetype && req.file.mimetype.startsWith("video")) {
        media = encryption(req.file.filename);
        type = "video";
    }
    return { media, type }
}

exports.createComment = async (req, res) => {
    try {
        const { media, type } = mediaValidator(req, res);
        if (validationError(req))
            return res.redirect("back");
        let prayerId = req.params.id;
        const userId = req.session.user;
        const comment = encryption(req.body.comment);
        const data = await commentModel.create({ comment, userId, prayerId, media, type });
        console.log(data);
        return res.redirect("back");
    } catch (error) {
        console.log(error);
        return res.redirect("back");
    }
};

exports.getComments = async (req, res) => {
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

exports.updateComment = async (req, res) => {
    if (validationError(req))
        return res.redirect("back");
    try {
        const comment = await commentModel.create(req.params.id, req.body, { new: true });
        return res.redirect("back");
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

exports.getComment = async (req, res) => {
    try {
        const comment = await commentModel.create(req.body);
        return res.redirect("back");
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await commentModel.create(req.body);
        return res.redirect("back");
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};