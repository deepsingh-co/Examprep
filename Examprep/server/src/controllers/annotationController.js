import { Op } from "sequelize";
import User from "../models/User.js";
import { Exam, Subject, Topic, Question, Option, TestAttempt, TestAttemptAnswer } from "../models/index.js";
import Annotation from "../models/Annotation.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { sendAnnotationEmail } from "../utils/emailHelper.js";

export const searchStudent = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return sendError(res, "Search query required", 400);

    const students = await User.findAll({
      where: {
        role: "student",
        name: { [Op.like]: `%${q}%` },
      },
      attributes: { exclude: ["password", "verifyToken"] },
      limit: 10,
    });
    return sendSuccess(res, students);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getStudentAttempts = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attempts = await TestAttempt.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Topic,
          as: "topic",
          include: [
            {
              model: Subject,
              as: "subject",
              include: [{ model: Exam, as: "exam" }],
            },
          ],
        },
        { model: Annotation, as: "annotations" },
      ],
      order: [["createdAt", "DESC"]],
    });
    return sendSuccess(res, attempts);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getAttemptDetail = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findByPk(attemptId, {
      include: [
        {
          model: Topic,
          as: "topic",
          include: [
            {
              model: Subject,
              as: "subject",
              include: [{ model: Exam, as: "exam" }],
            },
          ],
        },
        {
          model: TestAttemptAnswer,
          as: "answers",
          include: [
            {
              model: Question,
              as: "question",
              include: [{ model: Option, as: "options" }],
            },
          ],
        },
      ],
    });
    if (!attempt) return sendError(res, "Attempt not found", 404);
    return sendSuccess(res, attempt);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getMyAnnotations = async (req, res) => {
  try {
    const annotations = await Annotation.findAll({
      where: { student_id: req.user.id },
      include: [
        { model: User, as: "admin", attributes: ["id", "name"] },
        {
          model: TestAttempt,
          as: "attempt",
          include: [
            {
              model: Topic,
              as: "topic",
              include: [
                { model: Subject, as: "subject", include: [{ model: Exam, as: "exam" }] },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
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
    const student = await User.findByPk(student_id);
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