const express = require("express");
const Workout = require("../models/Workout");
const winston = require("../utils/winston");

const router = express.Router();
const dotenv = require("dotenv");
const { Types } = require("mongoose");

dotenv.config();

router.get("/health", function (req, res) {
  res.json({
    status: "Running",
  });
});

router.get("/", async (req, res) => {
  const { date } = req.query;
  const userId = req.user.id;

  try {
    let workoutData = await Workout.findOne({ userId, date });
    if (workoutData) {
      res.json(workoutData);
    } else {
      let freshWorkout = {
        date,
        userId,
        workout: {
          chest: [],
          back: [],
          shoulders: [],
          arms: [],
          legs: [],
          abs: [],
          cardio: [],
        },
      };
      res.json(freshWorkout);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put("/", async (req, res) => {
  const { date } = req.query;
  const { workout, notes } = req.body;
  const userId = req.user.id;

  try {
    let updated = await Workout.findOneAndUpdate(
      {
        userId,
        date,
      },
      {
        $set: {
          workout,
          notes,
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// SYNC
router.post("/prefill", async (req, res) => {
  const { date, group } = req.body;
  const userId = req.user.id;

  const groupQuery = `workout.${group}.0`;
  const updateGroupQuery = `workout.${group}`;
  const formattedDate = new Date(date);
  try {
    let previousRecord = await Workout.findOne({
      userId,
      date: { $lt: formattedDate },
      [groupQuery]: { $exists: true },
    }).sort({ date: -1 });
    if (previousRecord) {
      const exercises = previousRecord.workout[group];
      let updated = await Workout.findOneAndUpdate(
        {
          userId,
          date,
        },
        {
          $set: {
            [updateGroupQuery]: exercises,
          },
        },
        { upsert: true, returnDocument: "after" }
      );
      res.json(updated);
    } else {
      res.status(500).send(`No previous record found`);
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
