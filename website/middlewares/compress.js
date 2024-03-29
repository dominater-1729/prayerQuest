const express = require("express");
const { fork } = require("child_process");
const { v4: uuidv4 } = require('uuid');

const genrateSuffix = () => {
    return uuidv4();
}

const compressMiddleware = (req, res, next) => {
    const filename = req.file.filename;
    const tempFilePath = `${req.file.destination}/${filename}`;

    if (filename && tempFilePath) {
        // Create a new child process
        const child = fork(`${__dirname}/video.js`);
        // Send message to child process
        const prefix = genrateSuffix();
        const array = filename.split(".");
        const extension = array[array.length - 1];

        child.send({ tempFilePath, name: prefix + "." + extension });
        // Listen for message from child process
        child.on("message", (message) => {
            const { statusCode, text } = message;
            req.file.filename = prefix + "." + extension;
            next();
        });
    } else {
        res.status(400).send("No file uploaded");
    }
}

module.exports = compressMiddleware;
