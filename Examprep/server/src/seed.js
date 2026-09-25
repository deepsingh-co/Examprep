import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load models
import User from './models/User.js';
import Exam from './models/Exam.js';
import Subject from './models/Subject.js';
import Topic from './models/Topic.js';
import Question from './models/Question.js';
import University from './models/University.js';
import College from './models/College.js';
import Department from './models/Department.js';
import Semester from './models/Semester.js';
import TestAttempt from './models/TestAttempt.js';
import TestAttemptAnswer from './models/TestAttemptAnswer.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Exam.deleteMany({}),
      Subject.deleteMany({}),
      Topic.deleteMany({}),
      Question.deleteMany({}),
      University.deleteMany({}),
      College.deleteMany({}),
      Department.deleteMany({}),
      Semester.deleteMany({}),
      TestAttempt.deleteMany({}),
      TestAttemptAnswer.deleteMany({}),
    ]);

    // 1. Core Structures
    console.log('Seeding core structures...');
    const university = await University.create({ name: 'Mumbai University', code: 'MU' });
    const college = await College.create({ name: 'Engineering College', university_id: university._id });
    const dept = await Department.create({ name: 'Computer Engineering', code: 'CE', college_id: college._id });
    const semester = await Semester.create({ name: 'Semester 5', number: 5, department_id: dept._id });

    // 2. Users
    console.log('Seeding users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Faculty User',
        email: 'faculty@demo.com',
        password: 'password123',
        role: 'faculty',
        department_id: dept._id,
        isVerified: true
      },
      {
        name: 'Student User',
        email: 'student@demo.com',
        password: 'password123',
        role: 'student',
        university_id: university._id,
        college_id: college._id,
        department_id: dept._id,
        semester_id: semester._id,
        isVerified: true
      }
    ]);

    const admin = users[0];
    const faculty = users[1];
    const student = users[2];

    // 3. Exams & Subjects
    console.log('Seeding exams and subjects...');
    const exam = await Exam.create({
      name: 'Mumbai University Semester Exam',
      description: 'End semester examination',
      duration: 180,
      total_marks: 80
    });

    const subject = await Subject.create({
      name: 'Database Management System',
      code: 'CSC502',
      credits: 4,
      description: 'Introduction to database systems',
      department_id: dept._id,
      semester_id: semester._id,
      exam_id: exam._id,
      assigned_faculty: [faculty._id]
    });

    // 4. Topics
    console.log('Seeding topics...');
    const topic = await Topic.create({
      name: 'Relational Data Model & SQL',
      subject_id: subject._id,
      description: 'Module 2 covering relations, constraints and SQL'
    });

    // 5. Questions
    console.log('Seeding questions...');
    const questions = await Question.create([
      {
        topic_id: topic._id,
        question_text: 'Which of the following is NOT a DDL command in SQL?',
        type: 'MCQ',
        difficulty: 'easy',
        options: [
          { option_text: 'CREATE', is_correct: false },
          { option_text: 'UPDATE', is_correct: true },
          { option_text: 'ALTER', is_correct: false },
          { option_text: 'DROP', is_correct: false }
        ]
      },
      {
        topic_id: topic._id,
        question_text: 'Select the true statements about Primary Keys.',
        type: 'MULTI',
        difficulty: 'medium',
        options: [
          { option_text: 'It can contain NULL values', is_correct: false },
          { option_text: 'A table can have only one primary key', is_correct: true },
          { option_text: 'It uniquely identifies each record', is_correct: true },
          { option_text: 'It is the same as a foreign key', is_correct: false }
        ]
      },
      {
        topic_id: topic._id,
        question_text: 'What does SQL stand for? (Write only the first word)',
        type: 'NAQ',
        difficulty: 'easy',
        correct_answer: 'Structured'
      }
    ]);

    // 6. Test Attempts (For Demo)
    console.log('Seeding test attempts...');
    const attempt = await TestAttempt.create({
      student_id: student._id,
      topic_id: topic._id,
      score: 2,
      total_correct: 2,
      total_wrong: 1,
      total_questions: 3,
      time_taken: 180, // 3 minutes
      violations: 0,
      status: 'completed'
    });

    // Q1 Correct (MCQ)
    const q1CorrectOption = questions[0].options.find(o => o.is_correct);
    await TestAttemptAnswer.create({
      attempt_id: attempt._id,
      question_id: questions[0]._id,
      selected_option: q1CorrectOption._id,
      is_correct: true
    });

    // Q2 Wrong (MULTI) - selected a wrong option
    const q2WrongOption = questions[1].options.find(o => !o.is_correct);
    await TestAttemptAnswer.create({
      attempt_id: attempt._id,
      question_id: questions[1]._id,
      selected_option: q2WrongOption._id,
      is_correct: false
    });

    // Q3 Correct (NAQ)
    await TestAttemptAnswer.create({
      attempt_id: attempt._id,
      question_id: questions[2]._id,
      typed_answer: 'Structured',
      is_correct: true
    });

    console.log('✨ Seeding complete! You can now log in with:');
    console.log('Admin: admin@demo.com / password123');
    console.log('Faculty: faculty@demo.com / password123');
    console.log('Student: student@demo.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
