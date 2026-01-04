const express = require("express");

const router = express.Router();
const dotenv = require("dotenv");
const Question = require("../models/Question");
const Diet = require("../models/Diet");

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
              protein: {type: "number"}
            },
            required: ["meal", "calories", "protein"]
          },
          lunch: {
            type: "object",
            additionalProperties: false,
            properties: {
              meal: { type: "string" },
              calories: { type: "number" },
              protein: {type: "number"}
            },
            required: ["meal", "calories", "protein"]
          },
          dinner: {
            type: "object",
            additionalProperties: false,
            properties: {
              meal: { type: "string" },
              calories: { type: "number" },
              protein: {type: "number"}
            },
            required: ["meal", "calories", "protein"]
          },
          totalCalories: { type: "number" },
          proteinIntake: { type: "number" }
        },
        required: ["day", "breakfast", "lunch", "dinner", "totalCalories", "proteinIntake"]
      }
    },
    tips: {
      type: "array",
      minItems: 3,
      maxItems: 7,
      items: { type: "string" }
    }
  },
  required: ["week", "tips"]
};


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
    const response = await Diet.findOne({
      userId,
    });
    if (!response) {
      res.json(null);
      return;
    } else if (response.planCreated == false) {
      res.json({
        planCreated: false,
        msg: "Plan creation is in progress",
      });
    }
    res.json(response);
  } catch (err) {
    res.status(500).send("Server error", err.message);
  }
});

router.delete("/",  async (req, res) => {
  try {
    const userId = req.user.id;
    await Diet.deleteOne({
      userId
    });
    res.json("Diet plan reset successful");
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

    client.responses
      .create({
        model: "gpt-5.1",
        input: openAPI_input,
        text: {
          format: {
            type: "json_schema",
            name: "plan",
            schema: dietPlanSchema,
            strict: true
          },
        },
      })
      .then(async (res) => {
        try {
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
        } catch (err) {
          console.log(err);
        }
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
    res.json(response);
  } catch (err) {
    res.status(500).send("Server error", err.message);
  }
});

module.exports = router;
