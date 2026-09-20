import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    total_correct: {
      type: Number,
      default: 0,
    },
    total_wrong: {
      type: Number,
      default: 0,
    },
    total_questions: {
      type: Number,
      default: 0,
    },
    time_taken: {
      type: Number,
      default: 0, // Time in seconds
    },
    violations: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);

export default TestAttempt;
