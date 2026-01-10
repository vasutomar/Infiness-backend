const express = require("express");

const router = express.Router();
const dotenv = require("dotenv");
const Feedback = require("../models/Feedback");

dotenv.config();

router.get("/health", function (req, res) {
  res.json({
    status: "Running",
  });
});

router.put("/feedback", async (req, res) => {
  const { feedback } = req.body;

  try {
    await Feedback.insertOne({
      feedback,
    });
    res.json({
      msg: "Feedback Submitted!",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

module.exports = router;
