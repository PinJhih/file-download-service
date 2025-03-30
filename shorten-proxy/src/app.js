var express = require("express");
var path = require("path");
var httpError = require("http-errors");

// import middleware
var logger = require("morgan");
var staticFiles = express.static(path.join(__dirname, "../public"));

// import router instance
var router = require("./route.js");

// create an Express application instance
var app = express();

// configure view engines
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// bind middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// static files
app.use("/public", staticFiles);

// bind routers
app.use("/", router);

// handle not found error
app.use(function (_, _, next) {
  next(httpError(404, "Page not found"));
});

// handle http error
app.use(function (err, req, res, next) {
  res.locals.status = err.status || 500;
  res.locals.message = err.message || "Internal error";
  res.locals.error = res.app.get("env") === "development" ? err.stack : "";

  // render the error page
  res.status(res.locals.status);
  res.render("error");
});

module.exports = app;
