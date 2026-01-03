const mongoose = require("mongoose");

const QuestionListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  key: { type: String, required: true },
  type: { type: String, required: true },
  inputType: { type: String, required: false },
  placeholder: { type: String, required: false },
  options: { type: [String], required: false }
});

const QuestionSchema = new mongoose.Schema({
  key: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  questions: { type: [QuestionListSchema], required: true },
});

module.exports = mongoose.model("Questions", QuestionSchema);
