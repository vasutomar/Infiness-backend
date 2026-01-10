const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  endDate: { type: Date, required: true },
});

const OrgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "users",
    required: false,
  },
  plans: {
    type: [PlanSchema],
    required: true,
  },
});

module.exports = mongoose.model("Questions", OrgSchema);
