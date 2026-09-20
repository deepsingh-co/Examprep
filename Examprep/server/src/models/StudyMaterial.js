import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["pdf", "ppt", "docx", "image", "video_link", "external_resource"],
      required: true,
    },
    file_path: {
      type: String, // Can be URL or local path
      required: true,
    },
    file_size: {
      type: Number, // In bytes
    },
    tags: [
      {
        type: String,
      },
    ],
    uploader_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  { timestamps: true }
);

const StudyMaterial = mongoose.model("StudyMaterial", studyMaterialSchema);

export default StudyMaterial;
