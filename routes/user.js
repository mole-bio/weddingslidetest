const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hi user");
});

module.exports = router;
