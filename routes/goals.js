// routes/places.js
const express = require("express");
const router = express.Router();
const winston = require("../utils/winston");
const Goal = require("../models/Goal");

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({ userId }, { name: 1, progress: 1, _id: 1 });

    res.json(goals);
  } catch (err) {
    winston.error(`Error fetching goals: ${err.message}`, {
      error: err.stack,
    });
    res.status(500).json({ error: true, msg: "Internal server error" });
  }
});

router.get("/:goalId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      return res.status(404).json({ error: true, msg: "Goal not found" });
    }

    res.json(goal);
  } catch (err) {
    winston.error(`Error fetching goal: ${err.message}`, {
      error: err.stack,
    });
    res.status(500).json({ error: true, msg: "Internal server error" });
  }
});

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

router.put("/:goalId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;
    const { current, logDate = new Date(), ...rest } = req.body;

    const goal = await Goal.findOne({ _id: goalId, userId });
    const previousCurrent = goal.current;

    if (!goal) {
      return res.status(404).json({ error: true, msg: "Goal not found" });
    }

    Object.assign(goal, rest);

    if (typeof current === "number") {
      const normalizedDate = normalizeDate(logDate);

      const logIndex = goal.logs.findIndex(
        (log) => normalizeDate(log.date).getTime() === normalizedDate.getTime(),
      );

      if (logIndex !== -1) {
        goal.logs[logIndex].value = current;
      } else {
        // Add new log
        goal.logs.push({
          date: normalizedDate,
          value: current,
        });
      }

      goal.current = current;

      const improved =
        goal.comparison === "gte"
          ? current > previousCurrent
          : current < previousCurrent;

      goal.streak = improved ? goal.streak + 1 : 0;

      let progress =
        goal.comparison === "gte"
          ? ((current - goal.initial) / (goal.target - goal.initial)) * 100
          : ((goal.initial - current) / (goal.initial - goal.target)) * 100;

      goal.progress = Math.min(100, Math.max(0, Math.round(progress)));
      goal.isCompleted = goal.progress === 100;
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    winston.error(`Error updating goal: ${err.message}`, {
      error: err.stack,
    });
    res.status(500).json({ error: true, msg: "Internal server error" });
  }
});

router.delete("/:goalId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: goalId, userId });

    if (!goal) {
      return res.status(404).json({ error: true, msg: "Goal not found" });
    }

    res.json({ success: true, msg: "Goal deleted successfully" });
  } catch (err) {
    winston.error(`Error deleting goal: ${err.message}`, {
      error: err.stack,
    });
    res.status(500).json({ error: true, msg: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    let goalData = req.body;
    let comparison = goalData.current < goalData.target ? "lte" : "gte";
    const goal = new Goal({
      ...goalData,
      userId,
      current: goalData.initial,
      streak: 0,
      comparison,
      progress: 0,
      isCompleted: false,
      logs: [
        {
          date: normalizeDate(new Date()),
          value: goalData.initial,
        },
      ],
      startDate: normalizeDate(new Date()),
    });

    await goal.save();

    res.status(201).json(goal);
  } catch (err) {
    winston.error(`Error creating goal: ${err.message}`, {
      error: err.stack,
    });
    res.status(500).json({ error: true, msg: "Internal server error" });
  }
});

module.exports = router;
