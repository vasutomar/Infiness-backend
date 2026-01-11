const express = require("express");
const Exercises = require("../models/Exercise");
const winston = require("../utils/winston");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

router.get("/health", function (req, res) {
  winston.info("Exercises health check endpoint called");
  res.json({
    status: "Running",
  });
});

router.get("/", async (req, res) => {
  try {
    winston.info("Fetching all exercises");
    let exercises = await Exercises.find({});
    winston.info(`Retrieved ${exercises.length} total exercises from database`);

    let returnObject = {};
    const muscleGroups = [
      "chest",
      "back",
      "shoulders",
      "arms",
      "legs",
      "abs",
      "cardio",
    ];

    muscleGroups.forEach((e) => {
      returnObject[e] = [...exercises].filter((ex) => ex.muscleGroup == e);
    });

    // Log the distribution of exercises by muscle group
    const distribution = muscleGroups
      .map((group) => `${group}: ${returnObject[group].length}`)
      .join(", ");

    winston.info(`Exercises grouped by muscle groups - ${distribution}`);

    res.json(returnObject);
  } catch (err) {
    winston.error(`Error fetching exercises: ${err.message}`, {
      error: err.stack,
    });
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

module.exports = router;
