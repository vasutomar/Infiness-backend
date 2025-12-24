const express = require("express");
const Workout = require("../models/Workout");
const winston = require("../utils/winston");

const router = express.Router();
const dotenv = require("dotenv");
const { Types, Mongoose } = require("mongoose");

dotenv.config();

router.get("/health", function (req, res) {
  res.json({
    status: "Running",
  });
});

router.get("/group", async (req, res) => {
  const { group, month } = req.query;
  const userId = req.user.id;

  try {
    const year = 2025; // user selected year

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const allTracked = await Workout.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },
          workout: { $first: `$workout.${group}.title` },
        },
      },
    ]);

    const unique = new Set();
    allTracked.forEach((data) => {
      data.workout.forEach((w) => {
        unique.add(w);
      });
    });

    const exercises = Array.from(unique);

    const titleQuery = `workout.${group}.title`;
    let finalData = {};

    await Promise.all(
      exercises.map(async (exercise) => {
        const results = await Workout.aggregate([
          {
            $match: {
              userId: new Types.ObjectId(userId),
              date: {
                $gte: startOfMonth,
                $lte: endOfMonth,
              },
            },
          },
          { $unwind: `$workout.${group}` },
          {
            $match: {
              [titleQuery]: exercise,
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: { $dayOfMonth: "$date" },

              primaryKV: {
                $first: {
                  k: `$workout.${group}.primaryQualifier.label`,
                  v: `$workout.${group}.primaryQualifier.value`,
                },
              },

              secondaryKV: {
                $first: {
                  k: `$workout.${group}.secondaryQualifier.label`,
                  v: `$workout.${group}.secondaryQualifier.value`,
                },
              },
            },
          },
          {
            $project: {
              day: "$_id",
              data: {
                $mergeObjects: [
                  { $arrayToObject: [["$primaryKV"]] },
                  { $arrayToObject: [["$secondaryKV"]] },
                ],
              },
              _id: 0,
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [{ day: "$day" }, "$data"],
              },
            },
          },
          { $sort: { day: 1 } },
        ]);

        finalData[exercise] = results;
      })
    );

    res.json(finalData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/exercise", async (req, res) => {
  const { group, exercise, month } = req.query;
  const userId = req.user.id;

  try {
    const year = 2025; // user selected year

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const numberOfDays = [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;

    const titleQuery = `workout.${group}.title`;
    const results = await Workout.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $unwind: `$workout.${group}`,
      },
      {
        $match: {
          [titleQuery]: exercise,
        },
      },
      {
        $sort: { createdAt: -1 }, // latest entry per day
      },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },

          primaryKV: {
            $first: {
              k: `$workout.${group}.primaryQualifier.label`,
              v: `$workout.${group}.primaryQualifier.value`,
            },
          },

          secondaryKV: {
            $first: {
              k: `$workout.${group}.secondaryQualifier.label`,
              v: `$workout.${group}.secondaryQualifier.value`,
            },
          },
        },
      },
      {
        $project: {
          day: "$_id",
          data: {
            $mergeObjects: [
              { $arrayToObject: [["$primaryKV"]] },
              { $arrayToObject: [["$secondaryKV"]] },
            ],
          },
          _id: 0,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ day: "$day" }, "$data"],
          },
        },
      },
      {
        $sort: {
          day: 1,
        },
      },
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/breakup", async (req, res) => {
  const { month } = req.query;
  const userId = req.user.id;

  try {
    const year = 2025; // user selected year

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const numberOfDays = [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;
    const results = await Workout.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },
          workout: { $first: "$workout" },
        },
      },
    ]);

    const totalRecords = results.length;
    const counts = {
      chest: 0,
      back: 0,
      legs: 0,
      cardio: 0,
      arms: 0,
      shoulders: 0,
    };
    let keys = Object.keys(counts);
    for (let i = 0; i < totalRecords; i++) {
      keys.forEach((key) => {
        console.log("key", key);
        counts[key] += results[i].workout[key].length ? 1 : 0;
      });
    }
    const radarData = [
      {
        title: "Chest",
        key: "chest",
        count: counts.chest,
        fullMark: totalRecords,
      },
      {
        title: "Legs",
        key: "legs",
        count: counts.legs,
        fullMark: totalRecords,
      },
      {
        title: "Back",
        key: "back",
        count: counts.back,
        fullMark: totalRecords,
      },
      {
        title: "Cardio",
        key: "cardio",
        count: counts.cardio,
        fullMark: totalRecords,
      },
      {
        title: "Core",
        key: "core",
        count: counts.core,
        fullMark: totalRecords,
      },
      {
        title: "Arms",
        key: "arms",
        count: counts.arms,
        fullMark: totalRecords,
      },
      {
        title: "Shoulders",
        key: "shoulders",
        count: counts.shoulders,
        fullMark: totalRecords,
      },
    ];
    res.json(radarData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
