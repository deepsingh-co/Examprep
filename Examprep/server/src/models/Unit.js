import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    unit_number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    topics: [
      {
        type: String,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  { timestamps: true }
);

const Unit = mongoose.model("Unit", unitSchema);

export default Unit;
