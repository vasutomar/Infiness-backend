const mongoose = require("mongoose");

const EventPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  label: { type: String, required: true },
  participants: { type: Number, required: true },
  events: { type: Number, required: true },
});

module.exports = mongoose.model("eventplan", EventPlanSchema);
