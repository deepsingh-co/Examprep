import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true }
);

const Semester = mongoose.model("Semester", semesterSchema);

export default Semester;
