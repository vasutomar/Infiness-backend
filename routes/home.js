// routes/places.js
const express = require("express");
const router = express.Router();
const winston = require("../utils/winston");
const Goal = require("../models/Goal");
const Quote = require("../models/Quote");
const Diet = require("../models/Diet");
const Event = require("../models/Events");
const Workout = require("../models/Workout");

function getEventEndDate(date, duration) {
  return date.setDate(date.getDate() + duration);
}

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    let day = new Date().getDay();

    let homeData = {
      quote: null,
      goals: null,
      diet: null,
      event: null,
      stats: null,
    };

    const quote = await Quote.aggregate([
      {
        $sample: {
          size: 1,
        },
      },
    ]);
    const goals = await Goal.find({ userId }, { name: 1, progress: 1, _id: 1 });
    const diet = await Diet.findOne({ userId });
    let events = await Event.find(
      {
        participants: userId,
        isCancelled: false,
      },
      {
        name: 1,
        date: 1,
        type: 1,
        duration: 1,
        description: 1,
        _id: 1,
      },
    );
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    events = events.filter(
      (e) => getEventEndDate(e.date, e.duration) >= today.getTime(),
    );
    let workoutData = await Workout.findOne({ userId, date: today });
    let totalWeight = 0;
    let muscles = [];
    Object.keys(workoutData.workout).forEach((k) => {
      if (workoutData.workout[k].length) {
        muscles.push(k);
        workoutData.workout[k].forEach((e) => {
          let len = e.primaryQualifier.values.length;
          for (let i = 0; i < len; i++) {
            totalWeight +=
              e.primaryQualifier.values[i] * e.secondaryQualifier.values[i];
          }
        });
      }
    });
    if (muscles.length) {
      homeData.stats = {
        totalWeight,
        muscles,
      };
    }
    homeData.quote = quote[0];
    diet?.plan?.week && (homeData.diet = diet.plan.week[day]);
    goals.length && (homeData.goals = goals);
    events.length && (homeData.event = events);

    res.json(homeData);
  } catch (err) {
    winston.error(`Error fetching home data: ${err.message}`, {
      error: err.stack,
    });
    res.status(500).json({ error: true, msg: "Internal server error" });
  }
});

module.exports = router;
