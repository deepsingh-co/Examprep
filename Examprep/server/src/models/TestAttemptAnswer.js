import mongoose from "mongoose";

const testAttemptAnswerSchema = new mongoose.Schema(
  {
    attempt_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestAttempt",
      required: true,
    },
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selected_option: {
      type: mongoose.Schema.Types.ObjectId,
      // Refers to the ObjectId of the embedded option inside Question
    },
    typed_answer: {
      type: String,
    },
    is_correct: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TestAttemptAnswer = mongoose.model("TestAttemptAnswer", testAttemptAnswerSchema);

export default TestAttemptAnswer;
