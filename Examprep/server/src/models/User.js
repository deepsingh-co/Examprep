import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "faculty", "student"],
      required: true,
    },
    university_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    college_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    semester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
