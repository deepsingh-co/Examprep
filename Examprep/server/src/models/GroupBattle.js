import mongoose from "mongoose";

const groupBattleSchema = new mongoose.Schema(
  {
    room_code: {
      type: String,
      required: true,
      unique: true,
    },
    exam_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "active", "completed"],
      default: "waiting",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const GroupBattle = mongoose.model("GroupBattle", groupBattleSchema);

export default GroupBattle;
