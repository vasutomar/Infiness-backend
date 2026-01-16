const mongoose = require("mongoose");

const OrganizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: Number, required: false },
  email: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false,
  },
});

const StartStopSchema = new mongoose.Schema({
  start: { type: Number, required: true, default: 9 },
  end: { type: Number, required: true, default: 9 },
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
  type: {
    type: String,
    enum: ["Wellness", "Sport", "Running", "Strength"],
    required: true,
  },
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
    viewport: {
      northeast: {
        type: [Number], // [lng, lat]
        required: true,
      },
      southwest: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
  },
  timings: {
    type: StartStopSchema,
    required: true,
  },
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "users",
    required: false,
  },
  participantLimit: { type: Number, required: true, default: 10 },
});

EventsSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Events", EventsSchema);
