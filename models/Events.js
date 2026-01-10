const mongoose = require("mongoose");

const OrganizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: Number, required: true },
  email: { type: String, required: true },
});

const EventsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: Number,
    required: true,
  },
  organizerDetails: {
    type: OrganizerSchema,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "users",
    required: false,
  },
});

module.exports = mongoose.model("Events", EventsSchema);
