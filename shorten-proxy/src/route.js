var express = require("express");
var httpProxy = require("http-proxy");
var httpError = require("http-errors");

var urls = require("./urls");

var router = express.Router();
var proxy = httpProxy.createProxyServer({});

router.post("/shorten", async (req, res) => {
  let file_info = req.body;
  let name = file_info.name;
  let longURL = file_info.url;
  let expiry = file_info.expiry;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Invalid input" });
  } else if (!expiry || typeof expiry !== "number" || expiry % 1 !== 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    new URL(longURL);
  } catch (error) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    let shortURL = await urls.generateShortURL(name, longURL, expiry);
    res.send({ short_url: shortURL });
  } catch (err) {
    console.error("Fail to generate short URL:\n", err);
    res.status(500);
    res.json({ message: "Cannot generate short URL" });
  }
});

router.get("/download/:shortID", async (req, res, next) => {
  let longURL = null;
  try {
    // maps shortID into LongURL
    let shortID = `${req.params.shortID}`;
    let longURLString = await urls.toLongURL(shortID);
    if (!longURLString) {
      return next(httpError(404, "File Not Found"));
    }

    try {
      longURL = new URL(longURLString);
    } catch (err) {
      console.error("Invalid long URL:\n", err);
      return next(httpError(500, "Internal Error"));
    }
  } catch (err) {
    console.error("Failed to get long URL by shortID:\n", err);
    return next(httpError(500, "Internal Error"));
  }

  // extract the proxy target and rewrite the request
  let target = longURL.origin;
  let path = longURL.pathname + longURL.search;
  req.url = path;

  // proxy to MinIO Server
  proxy.web(req, res, { target: target, changeOrigin: true }, (err) => {
    console.error("Proxying failed:\n", err);
    next(httpError(500, "Internal Error"));
  });
});

router.get("/:shortID", async (req, res, next) => {
  try {
    let shortID = `${req.params.shortID}`;
    let fileName = await urls.getFileName(shortID);

    if (fileName) {
      res.render("download", {
        downloadLink: `/download/${shortID}`,
        fileName: fileName,
      });
    } else {
      return next(httpError(404, "File Not Found"));
    }
  } catch (err) {
    console.error("Failed to get file name by shortID:\n", err);
    return next(httpError(500, "Internal Error"));
  }
});

router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
