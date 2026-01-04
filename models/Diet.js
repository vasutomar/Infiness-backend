const mongoose = require("mongoose");

const MealSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  meal: { type: String, required: true }
})

const PlanSchema = new mongoose.Schema({
  day: { type: String, required: true },
  breakfast: { type: MealSchema, required: true },
  lunch: { type: MealSchema, required: true },
  dinner: { type: MealSchema, required: true },
  totalCalories: { type: String, required: true },
  proteinIntake: { type: String, required: true },
});

const PlanWithTipsSchema = new mongoose.Schema({
  week: { type: [PlanSchema], required: false },
  tips: { type: [String], required: false }
})

const DietSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  plan: { type: PlanWithTipsSchema, required: true },
  age: { type: String },
  height: { type: String },
  preference: { type: String },
  restriction: { type: String },
  sex: { type: String },
  weight: { type: String },
  diet: { type: [String] },
  cuisine: { type: [String] },
  goal: { type: [String] },
  planCreated: {type: Boolean, default: true }
});

module.exports = mongoose.model("Diet", DietSchema);
