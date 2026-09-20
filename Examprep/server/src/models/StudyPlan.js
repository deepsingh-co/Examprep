import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam_name: {
      type: String,
      required: true,
    },
    exam_date: {
      type: Date, // Date is equivalent to DATEONLY in usage if we extract only the date part
      required: true,
    },
    plan_data: {
      type: mongoose.Schema.Types.Mixed, // Mongoose way to store JSON
      required: true,
    },
  },
  { timestamps: true }
);

const StudyPlan = mongoose.model("StudyPlan", studyPlanSchema);

export default StudyPlan;
