import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    college_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
