import mongoose from "mongoose";

const battleParticipantSchema = new mongoose.Schema(
  {
    battle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupBattle",
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["waiting", "active", "finished"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

const BattleParticipant = mongoose.model("BattleParticipant", battleParticipantSchema);

export default BattleParticipant;
