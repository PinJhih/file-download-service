var express = require("express");
var router = express.Router();
var urls = require("./urls");

router.post("/shorten", async (req, res) => {
  let file_info = req.body;
  let name = file_info.name;
  let longURL = file_info.url;
  let expiry = file_info.expiry;

  let shortURL = await urls.generateShortURL(name, longURL, expiry);
  res.send({ short_url: shortURL });
});

router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
