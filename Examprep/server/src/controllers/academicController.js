import University from "../models/University.js";
import College from "../models/College.js";
import Department from "../models/Department.js";
import Semester from "../models/Semester.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

// University
export const createUniversity = async (req, res) => {
  try {
    const university = await University.create(req.body);
    return sendSuccess(res, university, "University created successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getUniversities = async (req, res) => {
  try {
    const universities = await University.find();
    return sendSuccess(res, universities);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// College
export const createCollege = async (req, res) => {
  try {
    const college = await College.create(req.body);
    return sendSuccess(res, college, "College created successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getColleges = async (req, res) => {
  try {
    const { university_id } = req.query;
    const query = university_id ? { university_id } : {};
    const colleges = await College.find(query).populate("university_id");
    return sendSuccess(res, colleges);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Department
export const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    return sendSuccess(res, department, "Department created successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getDepartments = async (req, res) => {
  try {
    const { college_id } = req.query;
    const query = college_id ? { college_id } : {};
    const departments = await Department.find(query).populate("college_id");
    return sendSuccess(res, departments);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Semester
export const createSemester = async (req, res) => {
  try {
    const semester = await Semester.create(req.body);
    return sendSuccess(res, semester, "Semester created successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getSemesters = async (req, res) => {
  try {
    const { department_id } = req.query;
    const query = department_id ? { department_id } : {};
    const semesters = await Semester.find(query).populate("department_id").sort({ number: 1 });
    return sendSuccess(res, semesters);
  } catch (err) {
    return sendError(res, err.message);
  }
};
