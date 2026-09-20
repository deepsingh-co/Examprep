import mongoose from "mongoose";

const pyqSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    exam_type: {
      type: String, // e.g., "Midterm", "Final", "End Semester"
      required: true,
    },
    file_path: {
      type: String, // Path to PDF
      required: true,
    },
    extracted_questions: [
      {
        question_text: String,
        marks: Number,
        topic: String,
      },
    ],
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    semester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    uploader_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const PYQ = mongoose.model("PYQ", pyqSchema);

export default PYQ;
