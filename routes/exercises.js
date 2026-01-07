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
  try {
    let exercises = await Exercises.find({});
    let returnObject = {};

    ['chest', 'back', 'shoulders', 'arms', 'legs', 'abs', 'cardio'].forEach((e) => {
      returnObject[e] = [...exercises].filter((ex => ex.muscleGroup == e));
    });

    res.json(returnObject);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
