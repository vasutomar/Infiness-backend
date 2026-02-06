const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
});

const GoalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  type: {
    type: String,
    enum: ["Fitness", "Performance", "Time", "Consistency"],
    required: false,
  },
  target: { type: Number, required: true },
  initial: { type: Number, required: true },
  current: { type: Number, required: true },
  unit: { type: String, required: false },
  streak: { type: Number, required: true },
  progress: { type: Number, required: false },
  comparison: { type: String, required: true, enum: ["lte", "gte"] },
  startDate: { type: Date, required: false },
  logs: { type: [LogSchema], required: false },
  isCompleted: { type: Boolean, required: false },
  dailyTarget: { type: Number, required: false },
  dailyValue: { type: Number, required: false },
  isDailyGoalCompleted: { type: Boolean, required: false },
  finishDate: { type: Date, required: false },
});

module.exports = mongoose.model("goal", GoalSchema);
