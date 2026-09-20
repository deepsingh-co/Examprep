import fs from "fs";
import pdfParse from "pdf-parse";
import Embedding from "../models/Embedding.js";
import StudyMaterial from "../models/StudyMaterial.js";

// Text chunking utility
const chunkText = (text, maxChunkSize = 1000, overlap = 200) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (currentLength + word.length > maxChunkSize) {
      chunks.push(currentChunk.join(" "));
      // Start new chunk with overlap
      currentChunk = currentChunk.slice(-Math.floor(overlap / 5)); // rough word estimate
      currentLength = currentChunk.join(" ").length;
    }
    currentChunk.push(word);
    currentLength += word.length + 1; // +1 for space
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }
  return chunks;
};

// Simplified lightweight vector representation since we don't have a real embedding model configured.
// We'll generate a dummy embedding or use a basic TF-IDF style approach if needed.
// For now, we just save the text chunk, and our aiKnowledgeController will just text-search or feed it directly.
const generateDummyEmbedding = (text) => {
  // Return an array of 1536 zeros (dummy for now) to satisfy the schema
  return Array.from({ length: 1536 }, () => Math.random() * 0.1);
};

export const processStudyMaterial = async (materialId, filePath) => {
  try {
    const material = await StudyMaterial.findById(materialId);
    if (!material) return;

    let textContent = "";

    if (material.type === "pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      textContent = data.text;
    } else {
      // Other types skipped for now
      return;
    }

    if (!textContent || textContent.trim() === "") return;

    // Chunk the text
    const chunks = chunkText(textContent);

    // Save chunks to DB
    const embeddingsToSave = chunks.map((chunk, index) => ({
      text_chunk: chunk,
      embedding: generateDummyEmbedding(chunk), // Replace with real embedding if API available
      page_number: index + 1, // Rough estimate
      study_material_id: material._id,
      subject_id: material.subject_id,
      unit_id: material.unit_id,
    }));

    await Embedding.insertMany(embeddingsToSave);
    console.log(`Successfully processed and chunked study material: ${material.title}`);
  } catch (error) {
    console.error(`Error processing study material ${materialId}:`, error);
  }
};
