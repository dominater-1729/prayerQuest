const express = require("express");
const { fork } = require("child_process");

const compressMiddleware = (req, res, next) => {
    const filename = req.file.filename;
    const originalName = req.file.originalname;
    const tempFilePath = `${req.file.destination}/${filename}`;

    if (filename && tempFilePath) {
        // Create a new child process
        console.log(`${__dirname}../utils/video.js`);
        const child = fork(`${__dirname}/video.js`);
        // Send message to child process
        child.send({ tempFilePath, name: originalName });
        // Listen for message from child process
        child.on("message", (message) => {
            const { statusCode, text } = message;
            console.log(text);
            // res.status(statusCode).send(text);
            // have to check the status code here
            next();

        });
    } else {
        res.status(400).send("No file uploaded");
    }

}

module.exports = compressMiddleware;