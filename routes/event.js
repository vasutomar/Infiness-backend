const express = require("express");
const Exercises = require("../models/Exercise");

const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

router.get("/health", function (req, res) {
  res.json({
    status: "Running",
  });
});

router.get("/", async (req, res) => {
  let { latitude, longitude, distance } = req.query;
  try {
    let events = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance,
        },
      },
    });

    res.json(events);
  } catch (err) {
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

module.exports = router;
