const express = require("express");

const router = express.Router();
const dotenv = require("dotenv");
const Question = require("../models/Question");
const Diet = require("../models/Diet");

dotenv.config();

const OpenAI = require("openai");
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


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

    // Generating OpenAPI response
    let openAPI_input = `Generate a weekly diet plan for me.`
    if (height) openAPI_input+=` I am ${height} cms tall.`;
    if (weight) openAPI_input+=` I weigh ${weight} kgs.`;
    if (goal) openAPI_input+=`  My goals are ${goal.toString()}.`;
    if (diet) openAPI_input+=` I follow ${diet.toString()} diet.`;
    if (cuisine) openAPI_input+=`  My cusinie is ${cuisine.toString()}`;
    if (restriction) openAPI_input+=`  I have following restrictions: ${restriction}.`;
    if (preference) openAPI_input+=` I prefer: ${preference}.`; 
    openAPI_input+= `Generate in a json format of type { day: "Monday", breakfast: "....", lunch: "....", dinner: "....", calorieCount: "700KCals", proteinCount: "20g" }`;
    openAPI_input+= `. only return JSON and no extra text.`;

    const chatGPTResponse = await client.responses.create({
      model: "gpt-4o",
      input: openAPI_input,
    });

    const response = await Diet.findOneAndUpdate(
      {
        userId,
      },
      {
        userId,
        plan: JSON.parse(chatGPTResponse.output_text),
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
