import StudyMaterial from "../models/StudyMaterial.js";
import PYQ from "../models/PYQ.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { processStudyMaterial } from "../utils/embeddingHelper.js";

export const uploadStudyMaterial = async (req, res) => {
  try {
    const { title, description, type, tags, unit_id, subject_id } = req.body;
    let file_path = req.body.file_path; // For external links/videos
    let file_size = 0;

    if (req.file) {
      file_path = `/uploads/${req.file.filename}`;
      file_size = req.file.size;
    }

    if (!title || !type || !file_path || !subject_id) {
      return sendError(res, "Title, type, file, and subject are required", 400);
    }

    const material = await StudyMaterial.create({
      title,
      description,
      type,
      file_path,
      file_size,
      tags: tags ? JSON.parse(tags) : [],
      uploader_id: req.user.id,
      unit_id,
      subject_id,
    });

    // If PDF, process in background for AI Knowledge Base
    if (type === "pdf" && req.file) {
      processStudyMaterial(material._id, req.file.path).catch(console.error);
    }

    return sendSuccess(res, material, "Study material uploaded successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getStudyMaterials = async (req, res) => {
  try {
    const { subject_id, unit_id } = req.query;
    const query = {};
    if (subject_id) query.subject_id = subject_id;
    if (unit_id) query.unit_id = unit_id;

    const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, materials);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return sendError(res, "Material not found", 404);
    
    // Check ownership or admin
    if (material.uploader_id.toString() !== req.user.id && req.user.role !== "admin") {
      return sendError(res, "Unauthorized", 403);
    }

    await StudyMaterial.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, "Material deleted");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const uploadPYQ = async (req, res) => {
  try {
    const { year, exam_type, subject_id, semester_id } = req.body;
    let file_path = req.body.file_path;

    if (req.file) {
      file_path = `/uploads/${req.file.filename}`;
    }

    if (!year || !exam_type || !file_path || !subject_id || !semester_id) {
      return sendError(res, "All fields are required", 400);
    }

    const pyq = await PYQ.create({
      year,
      exam_type,
      file_path,
      subject_id,
      semester_id,
      uploader_id: req.user.id,
    });

    return sendSuccess(res, pyq, "PYQ uploaded successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getPYQs = async (req, res) => {
  try {
    const { subject_id, semester_id } = req.query;
    const query = {};
    if (subject_id) query.subject_id = subject_id;
    if (semester_id) query.semester_id = semester_id;

    const pyqs = await PYQ.find(query).sort({ year: -1 });
    return sendSuccess(res, pyqs);
  } catch (err) {
    return sendError(res, err.message);
  }
};
