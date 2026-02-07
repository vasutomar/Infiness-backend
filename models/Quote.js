const mongoose = require("mongoose");

const Quote = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
  },
  by: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Quote", Quote);
