const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  day: { type: String, required: true },
  breakfast: { type: String, required: true },
  lunch: { type: String, required: true },
  dinner: { type: String, required: true },
  calorieCount: { type: String, required: true },
  proteinCount: { type: String, required: true },
});

const DietSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  plan: { type: [PlanSchema], required: true },
  age: { type: String },
  height: { type: String },
  preference: { type: String },
  restriction: { type: String },
  sex: { type: String },
  weight: { type: String },
  diet: { type: [String] },
  cuisine: { type: [String] },
  goal: { type: [String] },
});

module.exports = mongoose.model("Diet", DietSchema);
