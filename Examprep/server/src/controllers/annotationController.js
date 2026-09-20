import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import Question from "../models/Question.js";
import TestAttempt from "../models/TestAttempt.js";
import TestAttemptAnswer from "../models/TestAttemptAnswer.js";
import Annotation from "../models/Annotation.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { sendAnnotationEmail } from "../utils/emailHelper.js";

export const searchStudent = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return sendError(res, "Search query required", 400);

    const students = await User.find({
      role: "student",
      name: { $regex: q, $options: "i" },
    })
      .select("-password -verifyToken")
      .limit(10);
    return sendSuccess(res, students);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getStudentAttempts = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attempts = await TestAttempt.find({ student_id: studentId })
      .populate({
        path: "topic_id",
        populate: {
          path: "subject_id",
          populate: { path: "exam_id" },
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Since we can't easily populate annotations in reverse like Sequelize without virtuals,
    // we fetch them manually.
    for (let attempt of attempts) {
      attempt.annotations = await Annotation.find({ attempt_id: attempt._id });
    }

    return sendSuccess(res, attempts);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getAttemptDetail = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId)
      .populate({
        path: "topic_id",
        populate: {
          path: "subject_id",
          populate: { path: "exam_id" },
        },
      })
      .lean();

    if (!attempt) return sendError(res, "Attempt not found", 404);

    attempt.answers = await TestAttemptAnswer.find({ attempt_id: attempt._id })
      .populate("question_id")
      .lean();

    return sendSuccess(res, attempt);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getMyAnnotations = async (req, res) => {
  try {
    const annotations = await Annotation.find({ student_id: req.user.id })
      .populate("admin_id", "name")
      .populate({
        path: "attempt_id",
        populate: {
          path: "topic_id",
          populate: {
            path: "subject_id",
            populate: { path: "exam_id" },
          },
        },
      })
      .sort({ createdAt: -1 });

    return sendSuccess(res, annotations);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const saveAnnotation = async (req, res) => {
  try {
    const { attempt_id, student_id, type, feedback } = req.body;
    const admin_id = req.user.id;

    if (!attempt_id || !student_id || !type || !feedback) {
      return sendError(res, "All fields are required", 400);
    }

    const annotation = await Annotation.create({
      attempt_id,
      admin_id,
      student_id,
      type,
      feedback,
    });

    // Notify student via email
    const student = await User.findById(student_id);
    if (student) {
      try {
        await sendAnnotationEmail(student.email, feedback);
      } catch {
        console.log("Email sending failed (student may not have SMTP set)");
      }
    }

    return sendSuccess(res, annotation, "Annotation saved and email sent", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};