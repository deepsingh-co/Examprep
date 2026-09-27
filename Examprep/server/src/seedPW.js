import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load models
import User from './models/User.js';
import Exam from './models/Exam.js';
import Subject from './models/Subject.js';
import Topic from './models/Topic.js';
import Question from './models/Question.js';
import TestAttempt from './models/TestAttempt.js';
import TestAttemptAnswer from './models/TestAttemptAnswer.js';

dotenv.config();

const seedPW = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Core Structures
    console.log('Seeding PW like exams...');

    const exam = await Exam.create({
      name: 'JEE Main 2024 Demo Test',
      description: 'Full syllabus mock test for JEE Main',
      duration: 180, // 3 hours
      total_marks: 300
    });

    const physics = await Subject.create({
      name: 'Physics',
      code: 'PHY',
      description: 'Physics for JEE Main',
      exam_id: exam._id
    });

    const chemistry = await Subject.create({
      name: 'Chemistry',
      code: 'CHEM',
      description: 'Chemistry for JEE Main',
      exam_id: exam._id
    });

    const mathematics = await Subject.create({
      name: 'Mathematics',
      code: 'MATH',
      description: 'Mathematics for JEE Main',
      exam_id: exam._id
    });

    // Topics
    const kinematics = await Topic.create({
      name: 'Kinematics',
      subject_id: physics._id,
      description: 'Motion in one and two dimensions'
    });

    const thermodynamics = await Topic.create({
      name: 'Thermodynamics',
      subject_id: chemistry._id,
      description: 'Laws of thermodynamics and thermochemistry'
    });

    const calculus = await Topic.create({
      name: 'Calculus',
      subject_id: mathematics._id,
      description: 'Limits, Continuity, Differentiability and Integrals'
    });

    // Questions
    await Question.create([
      {
        topic_id: kinematics._id,
        question_text: 'A particle moves with a uniform velocity of 50 m/s for 20 minutes. What is the distance covered by the particle?',
        type: 'MCQ',
        difficulty: 'easy',
        options: [
          { option_text: '60 km', is_correct: true },
          { option_text: '50 km', is_correct: false },
          { option_text: '10 km', is_correct: false },
          { option_text: '30 km', is_correct: false }
        ]
      },
      {
        topic_id: kinematics._id,
        question_text: 'A car accelerates from rest at a constant rate a for some time, after which it decelerates at a constant rate b and comes to rest. If the total time elapsed is t, then the maximum velocity acquired by the car is:',
        type: 'MCQ',
        difficulty: 'medium',
        options: [
          { option_text: '(a+b)t / ab', is_correct: false },
          { option_text: 'abt / (a+b)', is_correct: true },
          { option_text: '(a-b)t / ab', is_correct: false },
          { option_text: 'abt / (a-b)', is_correct: false }
        ]
      },
      {
        topic_id: thermodynamics._id,
        question_text: 'Which of the following parameters does not characterize the thermodynamic state of matter?',
        type: 'MCQ',
        difficulty: 'easy',
        options: [
          { option_text: 'Temperature', is_correct: false },
          { option_text: 'Pressure', is_correct: false },
          { option_text: 'Work', is_correct: true },
          { option_text: 'Volume', is_correct: false }
        ]
      },
      {
        topic_id: thermodynamics._id,
        question_text: 'In an adiabatic process, which of the following is true?',
        type: 'MCQ',
        difficulty: 'medium',
        options: [
          { option_text: 'q = +w', is_correct: false },
          { option_text: 'q = 0', is_correct: true },
          { option_text: 'Delta E = q', is_correct: false },
          { option_text: 'P Delta V = 0', is_correct: false }
        ]
      },
      {
        topic_id: calculus._id,
        question_text: 'What is the derivative of sin(x) with respect to x?',
        type: 'MCQ',
        difficulty: 'easy',
        options: [
          { option_text: 'cos(x)', is_correct: true },
          { option_text: '-sin(x)', is_correct: false },
          { option_text: '-cos(x)', is_correct: false },
          { option_text: 'tan(x)', is_correct: false }
        ]
      },
      {
        topic_id: calculus._id,
        question_text: 'Evaluate the integral of x^2 dx from 0 to 1.',
        type: 'MCQ',
        difficulty: 'medium',
        options: [
          { option_text: '1', is_correct: false },
          { option_text: '1/2', is_correct: false },
          { option_text: '1/3', is_correct: true },
          { option_text: '1/4', is_correct: false }
        ]
      },
      {
        topic_id: kinematics._id,
        question_text: 'A ball is thrown vertically upwards. What is its velocity at the highest point? (Enter the numerical value in m/s)',
        type: 'NAQ',
        difficulty: 'easy',
        correct_answer: '0'
      }
    ]);

    console.log('✨ PW Demo Test Series Seeding complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding PW data:', error);
    process.exit(1);
  }
};

seedPW();
