const express = require("express");
const Workout = require("../models/Workout");
const winston = require("../utils/winston");
const router = express.Router();
const dotenv = require("dotenv");
const { Types } = require("mongoose");

dotenv.config();

router.get("/health", function (req, res) {
  winston.info("Tracker health check endpoint called");
  res.json({
    status: "Running",
  });
});

router.get("/", async (req, res) => {
  const { date } = req.query;
  const userId = req.user.id;

  try {
    winston.info(`Fetching workout tracker for user: ${userId}, date: ${date}`);

    let workoutData = await Workout.findOne({ userId, date });

    if (workoutData) {
      winston.info(`Workout data found for user: ${userId}, date: ${date}`);
      res.json(workoutData);
    } else {
      winston.info(
        `No workout data found for user: ${userId}, date: ${date}, returning fresh workout`
      );
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
    winston.error(
      `Error fetching workout tracker for user ${userId}: ${err.message}`,
      {
        error: err.stack,
        date,
      }
    );
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.put("/", async (req, res) => {
  const { date } = req.query;
  const { workout, notes } = req.body;
  const userId = req.user.id;

  try {
    winston.info(
      `Updating workout tracker for user: ${userId}, date: ${date}`,
      {
        hasNotes: !!notes,
        muscleGroups: Object.keys(workout).filter(
          (key) => workout[key]?.length > 0
        ),
      }
    );

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

    winston.info(
      `Workout tracker updated successfully for user: ${userId}, date: ${date}`
    );
    res.json(updated);
  } catch (err) {
    winston.error(
      `Error updating workout tracker for user ${userId}: ${err.message}`,
      {
        error: err.stack,
        date,
      }
    );
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
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
    winston.info(
      `Prefilling workout for user: ${userId}, date: ${date}, group: ${group}`
    );

    let previousRecord = await Workout.findOne({
      userId,
      date: { $lt: formattedDate },
      [groupQuery]: { $exists: true },
    }).sort({ date: -1 });

    if (previousRecord) {
      const exercises = previousRecord.workout[group];
      winston.info(
        `Found previous record for prefill - user: ${userId}, group: ${group}, exercises: ${exercises.length}`,
        {
          previousDate: previousRecord.date,
        }
      );

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

      winston.info(
        `Workout prefilled successfully for user: ${userId}, date: ${date}, group: ${group}`
      );
      res.json(updated);
    } else {
      winston.warn(
        `No previous record found for prefill - user: ${userId}, group: ${group}, date: ${date}`
      );
      res
        .status(404)
        .json({ error: true, msg: `No previous workout found for ${group}` });
    }
  } catch (err) {
    winston.error(
      `Error prefilling workout for user ${userId}: ${err.message}`,
      {
        error: err.stack,
        date,
        group,
      }
    );
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

module.exports = router;
