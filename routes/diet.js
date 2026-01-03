const express = require("express");

const router = express.Router();
const dotenv = require("dotenv");
const Question = require("../models/Question");
const Diet = require("../models/Diet");

dotenv.config();

router.get("/health", function (req, res) {
  res.json({
    status: "Running",
  });
});

router.get("/questions", async (req, res) => {
  try {
    const response = await Question.find({});
    res.json(response);
  } catch (err) {
    res.status(500).send("Server error", err.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await Diet.find({
      userId,
    });
    res.json(response);
  } catch (err) {
    res.status(500).send("Server error", err.message);
  }
});

router.put("/", async (req, res) => {
  try {
    const {
      age,
      height,
      preference,
      restriction,
      sex,
      weight,
      diet,
      cuisine,
      goal,
    } = req.body;
    const userId = req.user.id;
    const response = await Diet.findOneAndUpdate(
      {
        userId,
      },
      {
        userId,
        plan: [],
        age,
        height,
        preference,
        restriction,
        sex,
        weight,
        diet,
        cuisine,
        goal,
      },
      { upsert: true, returnDocument: "after" }
    );
    res.json(response);
  } catch (err) {
    res.status(500).send("Server error", err.message);
  }
});

module.exports = router;
