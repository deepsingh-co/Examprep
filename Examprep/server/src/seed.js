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
    const university = await University.create({ name: 'Tech University', code: 'TU' });
    const college = await College.create({ name: 'College of Engineering', university_id: university._id });
    const dept = await Department.create({ name: 'Computer Science', code: 'CS', college_id: college._id });
    const semester = await Semester.create({ name: 'Semester 1', number: 1, department_id: dept._id });

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
      name: 'Midterm Examination 2026',
      description: 'First midterm covering basics',
      duration: 60,
      total_marks: 100
    });

    const subject = await Subject.create({
      name: 'Computer Networks',
      code: 'CS401',
      credits: 4,
      description: 'Introduction to networking concepts',
      department_id: dept._id,
      semester_id: semester._id,
      exam_id: exam._id,
      assigned_faculty: [faculty._id]
    });

    // 4. Topics
    console.log('Seeding topics...');
    const topic = await Topic.create({
      name: 'OSI Model and TCP/IP',
      subject_id: subject._id,
      description: 'Layers, protocols, and network architecture'
    });

    // 5. Questions
    console.log('Seeding questions...');
    const questions = await Question.create([
      {
        topic_id: topic._id,
        question_text: 'Which layer of the OSI model is responsible for routing?',
        type: 'MCQ',
        difficulty: 'easy',
        options: [
          { option_text: 'Physical Layer', is_correct: false },
          { option_text: 'Data Link Layer', is_correct: false },
          { option_text: 'Network Layer', is_correct: true },
          { option_text: 'Transport Layer', is_correct: false }
        ]
      },
      {
        topic_id: topic._id,
        question_text: 'Select the protocols that operate at the Transport Layer of the OSI model.',
        type: 'MULTI',
        difficulty: 'medium',
        options: [
          { option_text: 'TCP', is_correct: true },
          { option_text: 'IP', is_correct: false },
          { option_text: 'UDP', is_correct: true },
          { option_text: 'HTTP', is_correct: false }
        ]
      },
      {
        topic_id: topic._id,
        question_text: 'How many layers does the standard OSI model have?',
        type: 'NAQ',
        difficulty: 'easy',
        correct_answer: '7'
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
      time_taken: 120, // 2 minutes
      violations: 1,
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
      typed_answer: '7',
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
