const express = require("express");
const app = express();
const session = require("express-session");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const store = require("./db.js");
const path = require("path");
require("dotenv").config();
const decrypt = require("./helpers/decryptData.js")

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1000gb" }));
app.use(express.urlencoded({ limit: "1000gb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
let paginate = require("handlebars-paginate");
hbs.registerPartials(__dirname + "/view/partials");
app.use(cookieParser());
const website = require("./website/routes/routes.js");
const api = require("./API/routes/route.js");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    store: store,
  })
);

app.use("/website", website);
app.use("/api/v1", api);

app.get("/", async (req, res) => {
  res.send("Hello");
});

hbs.registerHelper("equal", function (val1, val2, options) {
  if (val1 == val2) {
    return options.fn(this);
  }
});

hbs.registerHelper("greater_1", function (conditional, options) {
  if (conditional > 1) {
    return options.fn(this);
  }
});

hbs.registerHelper("paginate", paginate);
hbs.registerHelper("pageCount", function (pages, index) {
  index++;
  index = 10 * pages - 10 + index;
  return index;
});
hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
hbs.registerHelper('eq', function () {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.every(function (expression) {
    return args[0] === expression;
  });
});
hbs.registerHelper("log", function (something) {
  console.log(something);
});
hbs.registerHelper("dom", function (selector) {
  var butter = document.getElementById("");
  console.log("thisid:", butter);
})
hbs.registerHelper("isJoined", function (isAdmin, isRequested, isMember, groupId) {
  let buttonName = "";

  console.log(isAdmin, isRequested, isMember);

  if (isRequested)
    buttonName += `<button class="btn btn-outline-custom circle-group-button" value="requested" disabled="true">Requested</button>`;
  else if (isAdmin || isMember)
    buttonName += `<button class="btn btn-outline-custom circle-group-button" value="requested"
    disabled="true">Joined</button>`;
  else buttonName = `<a href = "/website/join/${groupId}" class="btn btn-outline-custom circle-group-button" value="requested"
    disabled="true">Join Group</a>`;

  return buttonName;
})
hbs.registerHelper("decryptImage", function (image) {
  if (!image) return "default.jpeg";
  else return decrypt(image);
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} `);
});
