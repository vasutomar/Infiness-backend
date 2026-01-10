const mongoose = require("mongoose");

const OrganizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: Number, required: true },
  email: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false,
  },
});

const EventsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
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
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  isCancelled: { type: Boolean, required: true, default: false },
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

EventsSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Events", EventsSchema);
