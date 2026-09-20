import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    university_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
  },
  { timestamps: true }
);

const College = mongoose.model("College", collegeSchema);

export default College;
