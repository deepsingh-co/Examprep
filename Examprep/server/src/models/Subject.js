import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
    },
    credits: {
      type: Number,
    },
    thumbnail: {
      type: String,
    },
    description: {
      type: String,
    },
    university_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    semester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
    },
    assigned_faculty: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    exam_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
