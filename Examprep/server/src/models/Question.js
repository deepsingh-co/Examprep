import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  option_text: {
    type: String,
    required: true,
  },
  is_correct: {
    type: Boolean,
    default: false,
  },
});

const questionSchema = new mongoose.Schema(
  {
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    question_text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["MCQ", "MULTI", "NAQ"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    correct_answer: {
      type: String,
    },
    source: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
    },
    options: [optionSchema],
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
