const notificationModel = require("../models/notification")

exports.countDays = function (date1, date2) {
    return Math.ceil(Math.abs(date2 - date) / 1000 * 60 * 60 * 24);
}

exports.timeAgo = function (timestamp) {
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

exports.createNotification = async ({ to, type, description, link }) => {
    try {
        const data = await notificationModel.create({ to, type, description, link });
        return data;
    }
    catch (err) { console.log(err); throw new Error(err); }
}