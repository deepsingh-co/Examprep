import StudyMaterial from "../models/StudyMaterial.js";
import Embedding from "../models/Embedding.js";
import { callClaude, extractJson } from "../utils/aiHelper.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

// Basic in-memory vector search using cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const generateResource = async (req, res) => {
  try {
    const { subject_id, unit_id, resource_type, topic } = req.body;
    if (!subject_id || !resource_type) {
      return sendError(res, "subject_id and resource_type are required", 400);
    }

    // 1. Fetch relevant chunks from the database
    const query = { subject_id };
    if (unit_id) query.unit_id = unit_id;
    
    // In a real vector DB, we'd embed the user's prompt and do a vector search here.
    // For now, since we may not have Atlas Vector Search, we just grab chunks for the unit.
    const chunks = await Embedding.find(query).limit(20).lean();
    const contextText = chunks.map((c) => c.text_chunk).join("\n\n");

    if (!contextText) {
      return sendError(res, "No study materials found for this topic/unit to generate resources.", 404);
    }

    // 2. Ask Claude to generate the requested resource type based on the context
    const messages = [
      {
        role: "system",
        content: `You are an expert academic tutor. Generate a ${resource_type} based ONLY on the provided context. Context:\n${contextText}`
      },
      {
        role: "user",
        content: `Please generate a ${resource_type} for ${topic ? "the topic: " + topic : "this unit"}. Return the result in a well-formatted markdown or JSON structure.`
      }
    ];

    const responseText = await callClaude(messages, false, 1500);

    return sendSuccess(res, { resource: responseText }, "Resource generated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};
