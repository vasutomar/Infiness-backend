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

router.get("/", async (req, res) => {
  const { timeline, group, exercise, month } = req.query;
  const userId = req.user.id;

  try {
    winston.info(`GRAPH - GET : Fetching ${timeline} workout`);
    const year = 2025; // user selected year

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const numberOfDays = [1,3,5,7,8,10,12].includes(month) ? 31 : 30;

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
          day: 1
        }
      }
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
