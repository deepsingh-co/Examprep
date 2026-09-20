import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema(
  {
    text_chunk: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number], // Array of floats
      required: true,
    },
    page_number: {
      type: Number,
    },
    keywords: [
      {
        type: String,
      },
    ],
    study_material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyMaterial",
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
  },
  { timestamps: true }
);

const Embedding = mongoose.model("Embedding", embeddingSchema);

export default Embedding;
