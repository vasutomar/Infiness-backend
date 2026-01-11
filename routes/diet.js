const express = require("express");

const router = express.Router();
const dotenv = require("dotenv");
const Question = require("../models/Question");
const Diet = require("../models/Diet");
const winston = require("../utils/winston");

dotenv.config();

const OpenAI = require("openai");
const { format } = require("winston");
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const dietPlanSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    week: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          day: { type: "string" },
          breakfast: {
            type: "object",
            additionalProperties: false,
            properties: {
              meal: { type: "string" },
              calories: { type: "number" },
              protein: { type: "number" },
            },
            required: ["meal", "calories", "protein"],
          },
          lunch: {
            type: "object",
            additionalProperties: false,
            properties: {
              meal: { type: "string" },
              calories: { type: "number" },
              protein: { type: "number" },
            },
            required: ["meal", "calories", "protein"],
          },
          dinner: {
            type: "object",
            additionalProperties: false,
            properties: {
              meal: { type: "string" },
              calories: { type: "number" },
              protein: { type: "number" },
            },
            required: ["meal", "calories", "protein"],
          },
          totalCalories: { type: "number" },
          proteinIntake: { type: "number" },
        },
        required: [
          "day",
          "breakfast",
          "lunch",
          "dinner",
          "totalCalories",
          "proteinIntake",
        ],
      },
    },
    tips: {
      type: "array",
      minItems: 3,
      maxItems: 7,
      items: { type: "string" },
    },
  },
  required: ["week", "tips"],
};

router.get("/health", function (req, res) {
  winston.info("Diet health check endpoint called");
  res.json({
    status: "Running",
  });
});

router.get("/questions", async (req, res) => {
  try {
    winston.info("Fetching diet questions");
    const response = await Question.find({});
    winston.info(
      `Diet questions fetched successfully, count: ${response.length}`
    );
    res.json(response);
  } catch (err) {
    winston.error(`Error fetching diet questions: ${err.message}`, {
      error: err.stack,
    });
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    winston.info(`Fetching diet plan for user: ${userId}`);
    const response = await Diet.findOne({
      userId,
    });
    if (!response) {
      winston.info(`No diet plan found for user: ${userId}`);
      res.json(null);
      return;
    } else if (response.planCreated == false) {
      winston.info(`Diet plan creation in progress for user: ${userId}`);
      res.json({
        planCreated: false,
        msg: "Plan creation is in progress",
      });
    }
    winston.info(`Diet plan retrieved successfully for user: ${userId}`);
    res.json(response);
  } catch (err) {
    winston.error(
      `Error fetching diet plan for user ${req.user.id}: ${err.message}`,
      { error: err.stack }
    );
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.delete("/", async (req, res) => {
  try {
    const userId = req.user.id;
    winston.info(`Deleting diet plan for user: ${userId}`);
    await Diet.deleteOne({
      userId,
    });
    winston.info(`Diet plan deleted successfully for user: ${userId}`);
    res.json("Diet plan reset successful");
  } catch (err) {
    winston.error(
      `Error deleting diet plan for user ${req.user.id}: ${err.message}`,
      { error: err.stack }
    );
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
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

    winston.info(`Creating/updating diet plan for user: ${userId}`, {
      age,
      height,
      sex,
      weight,
      goal: goal?.toString(),
      diet: diet?.toString(),
      cuisine: cuisine?.toString(),
    });

    // Generating OpenAPI response
    let openAPI_input = `Generate a weekly diet plan for me.`;
    if (height) openAPI_input += ` I am ${height} cms tall.`;
    if (weight) openAPI_input += ` I weigh ${weight} kgs.`;
    if (goal) openAPI_input += `  My goals are ${goal.toString()}.`;
    if (diet) openAPI_input += ` I follow ${diet.toString()} diet.`;
    if (cuisine) openAPI_input += `  My cusinie is ${cuisine.toString()}`;
    if (restriction)
      openAPI_input += `  I have following restrictions: ${restriction}.`;
    if (preference) openAPI_input += ` I prefer: ${preference}.`;
    openAPI_input += `. only return JSON and no extra text.`;

    winston.info(
      `Sending diet plan generation request to OpenAI for user: ${userId}`
    );

    client.responses
      .create({
        model: "gpt-5.1",
        input: openAPI_input,
        text: {
          format: {
            type: "json_schema",
            name: "plan",
            schema: dietPlanSchema,
            strict: true,
          },
        },
      })
      .then(async (res) => {
        try {
          winston.info(`Received response from OpenAI for user: ${userId}`);
          let parsedResponse = JSON.parse(res.output_text);
          await Diet.findOneAndUpdate(
            {
              userId,
            },
            {
              plan: parsedResponse,
              planCreated: true,
            }
          );
          winston.info(
            `Diet plan generated and saved successfully for user: ${userId}`
          );
        } catch (err) {
          winston.error(
            `Error processing OpenAI response for user ${userId}: ${err.message}`,
            { error: err.stack }
          );
        }
      })
      .catch((err) => {
        winston.error(`OpenAI API error for user ${userId}: ${err.message}`, {
          error: err.stack,
        });
      });

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
        planCreated: false,
      },
      { upsert: true, returnDocument: "after" }
    );

    winston.info(
      `Diet plan placeholder created for user: ${userId}, awaiting AI generation`
    );
    res.json(response);
  } catch (err) {
    winston.error(
      `Error creating diet plan for user ${req.user.id}: ${err.message}`,
      { error: err.stack }
    );
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

module.exports = router;
