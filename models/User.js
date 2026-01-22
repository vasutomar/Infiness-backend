const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    streak: {
      type: Number,
      required: false,
    },
    lastLogin: {
      type: Date,
      required: false,
    },
    passwordResetToken: {
      type: String,
      required: false,
    },
    passwordResetExpires: {
      type: String,
      required: false,
    },
    eventPlan: {
      type: String,
      enum: ["Free", "Basic"],
      required: false,
      default: "Free",
    },
    isEmailVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      required: false,
    },
    emailVerificationExpires: {
      type: String,
      required: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
