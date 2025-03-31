var express = require("express");
var httpProxy = require("http-proxy");
var httpError = require("http-errors");

var urls = require("./urls");

var router = express.Router();
var proxy = httpProxy.createProxyServer({});

router.post("/shorten", async (req, res, next) => {
  let file_info = req.body;
  let name = file_info.name;
  let longURL = file_info.url;
  let expiry = file_info.expiry;

  let shortURL = await urls.generateShortURL(name, longURL, expiry);
  res.send({ short_url: shortURL });
});

router.get("/download/:shortID", async (req, res, next) => {
  let shortID = req.params.shortID;
  let longURLString = await urls.toLongURL(shortID);
  let longURL = new URL(longURLString);

  let target = longURL.origin;
  let path = longURL.pathname + longURL.search;
  req.url = path;
  proxy.web(req, res, { target: target, changeOrigin: true }, (err) => {
    console.error("Proxying failed:", err);
    next(httpError(500, "Internal Error"));
  });
});

router.get("/:shortID", async (req, res, next) => {
  let shortID = req.params.shortID;
  let fileName = await urls.getFileName(shortID);

  if (fileName) {
    res.render("download", {
      downloadLink: `/download/${shortID}`,
      fileName: fileName,
    });
  }
});

router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
