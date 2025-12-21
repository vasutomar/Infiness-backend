// workoutDay.schema.ts
const mongoose = require("mongoose");

const QualifierSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: Number, required: true },
});

const ExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  primaryQualifier: { type: QualifierSchema, required: true },
  secondaryQualifier: { type: QualifierSchema, required: true },
});

const WorkoutSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    workout: {
      chest: [ExerciseSchema],
      back: [ExerciseSchema],
      shoulders: [ExerciseSchema],
      arms: [ExerciseSchema],
      legs: [ExerciseSchema],
      abs: [ExerciseSchema],
      cardio: [ExerciseSchema]
    },
    notes: { type: String },
  },
  {
    collection: "workouts",
    timestamps: true,
  }
);
WorkoutSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Workout", WorkoutSchema);
