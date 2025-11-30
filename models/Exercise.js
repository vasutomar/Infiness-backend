// workoutDay.schema.ts
const mongoose = require("mongoose");

const QualifierSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: Number, required: true },
});

const ExerciseSchema = new mongoose.Schema(
  {
    muscleGroup: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    primaryQualifier: { type: QualifierSchema, required: true },
    secondaryQualifier: { type: QualifierSchema, required: true },
  },
  {
    collection: "exercises",
    timestamps: true,
  }
);

module.exports = mongoose.model("Exercises", ExerciseSchema);
