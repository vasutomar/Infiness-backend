const mongoose = require("mongoose");

const OnboardingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Onboarding", OnboardingSchema);
