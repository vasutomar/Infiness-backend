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
    winston.info("WORKOUT - GET : Fetching current workout");
    let workoutData = await Workout.findOne({ userId, date });
    if (workoutData) {
      winston.info("WORKOUT - GET : Current workout found");
      res.json(workoutData);
    } else {
      winston.info("WORKOUT - GET : No current workout found");
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
// router.post("/", async (req, res) => {
//   const { date } = req.body;
//   const userId = req.user.id;

//   const formattedDate = new Date(date);

//   try {
//     const existingWorkout = await Workout.findOne({ userId, date });
//     if (existingWorkout) {
//         existingWorkout.workout = workout;
//         let updated = await Workout.findOneAndUpdate({
//             userId,
//             date
//         }, {
//             $set: {
//                 workout
//             }
//         });
//         res.json({ workout: updated})
//     } else {
//       let workoutObject = new Workout({
//         date: formattedDate,
//         userId,
//         workout,
//         notes,
//       });
//       await workoutObject.save();
//       res.json({ workout: workoutObject });
//     }
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// });

module.exports = router;
