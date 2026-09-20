import University from "../models/University.js";
import College from "../models/College.js";
import Department from "../models/Department.js";
import Semester from "../models/Semester.js";
import Subject from "../models/Subject.js";
import Unit from "../models/Unit.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const seedDemoCurriculum = async (req, res) => {
  try {
    // 1. Create University
    const university = await University.create({
      name: "Mumbai University",
      location: "Mumbai, India",
    });

    // 2. Create College
    const college = await College.create({
      name: "Demo College of Engineering",
      university_id: university._id,
    });

    // 3. Create Department
    const department = await Department.create({
      name: "Information Technology",
      college_id: college._id,
    });

    // 4. Create Semester
    const semester = await Semester.create({
      name: "Semester 3",
      number: 3,
      department_id: department._id,
    });

    // 5. Create Subjects
    const subjectsToCreate = [
      { name: "Database Management System", code: "ITC301", credits: 4 },
      { name: "Operating Systems", code: "ITC302", credits: 4 },
      { name: "Computer Networks", code: "ITC303", credits: 4 },
      { name: "Java Programming", code: "ITC304", credits: 4 },
      { name: "Discrete Mathematics", code: "ITC305", credits: 4 },
    ];

    const subjects = [];
    for (const sub of subjectsToCreate) {
      const subject = await Subject.create({
        ...sub,
        university_id: university._id,
        department_id: department._id,
        semester_id: semester._id,
      });
      subjects.push(subject);

      // 6. Create 5 Units for each subject
      for (let i = 1; i <= 5; i++) {
        await Unit.create({
          unit_number: i,
          title: `Unit ${i}`,
          description: `Core concepts for ${sub.name} - Unit ${i}`,
          topics: [`Topic A`, `Topic B`, `Topic C`],
          order: i,
          subject_id: subject._id,
        });
      }
    }

    return sendSuccess(res, { university, subjects }, "Demo curriculum seeded successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};
