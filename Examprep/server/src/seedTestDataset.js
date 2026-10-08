import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Exam from "./models/Exam.js";
import Subject from "./models/Subject.js";
import Unit from "./models/Unit.js";
import Topic from "./models/Topic.js";
import Question from "./models/Question.js";
import University from "./models/University.js";
import College from "./models/College.js";
import Department from "./models/Department.js";
import Semester from "./models/Semester.js";
import TestAttempt from "./models/TestAttempt.js";
import TestAttemptAnswer from "./models/TestAttemptAnswer.js";

dotenv.config();

// ---------- question builders ----------
const MCQ = (question_text, options, correctIndex, difficulty = "medium") => ({
  type: "MCQ",
  difficulty,
  question_text,
  options: options.map((t, i) => ({ option_text: t, is_correct: i === correctIndex })),
});

const MULTI = (question_text, options, correctIndexes, difficulty = "medium") => ({
  type: "MULTI",
  difficulty,
  question_text,
  options: options.map((t, i) => ({ option_text: t, is_correct: correctIndexes.includes(i) })),
});

const NAQ = (question_text, answer, difficulty = "easy") => ({
  type: "NAQ",
  difficulty,
  question_text,
  correct_answer: answer,
  options: [],
});

// ---------- dataset ----------
const USERS = [
  { name: "Dr. Priya Sharma", email: "priya.faculty@demo.com", role: "faculty" },
  { name: "Prof. Arjun Mehta", email: "arjun.faculty@demo.com", role: "faculty" },
  { name: "Aarav Patel", email: "aarav@demo.com", role: "student" },
  { name: "Diya Singh", email: "diya@demo.com", role: "student" },
  { name: "Rohan Gupta", email: "rohan@demo.com", role: "student" },
  { name: "Ananya Iyer", email: "ananya@demo.com", role: "student" },
  { name: "Kabir Verma", email: "kabir@demo.com", role: "student" },
  { name: "Sara Khan", email: "sara@demo.com", role: "student" },
];

const EXAMS = [
  {
    name: "JEE Main 2026 Test Series",
    description: "Full syllabus mock tests for JEE Main 2026",
    duration: 180,
    total_marks: 300,
    subjects: [
      {
        name: "Physics",
        code: "PHY-101",
        credits: 4,
        description: "Mechanics, thermodynamics and electromagnetism",
        units: [
          { unit_number: 1, title: "Mechanics", topics: ["Kinematics", "Laws of Motion", "Work, Energy and Power", "Rotational Motion"] },
        ],
        topics: [
          {
            name: "Kinematics",
            description: "Motion in a straight line and projectile motion",
            questions: [
              MCQ("A particle moves such that its position x (in m) as a function of time t is x = 5t - 10t². Its velocity at t = 1 s is:", ["5 m/s", "-15 m/s", "-5 m/s", "15 m/s"], 1, "medium"),
              MCQ("The range of a projectile launched at 45° with speed 20 m/s (g = 10 m/s²) is:", ["10 m", "20 m", "40 m", "400 m"], 2, "easy"),
              NAQ("Average velocity of a body that covers 100 m in 20 s in m/s is:", "5", "easy"),
              MULTI("For a projectile (ignoring air resistance), which quantities remain constant?", ["Horizontal component of velocity", "Vertical component of velocity", "Acceleration", "Speed"], [0, 2], "medium"),
            ],
          },
          {
            name: "Laws of Motion",
            description: "Newton's laws, friction and circular motion",
            questions: [
              MCQ("A 5 kg body is acted on by a net force of 20 N. Its acceleration is:", ["100 m/s²", "4 m/s²", "0.25 m/s²", "15 m/s²"], 1, "easy"),
              MCQ("The coefficient of static friction is always ______ the coefficient of kinetic friction:", ["greater than", "less than", "equal to", "zero"], 0, "easy"),
              NAQ("Newton's second law is commonly written as F = ma, where F is measured in newtons. Force equals mass times what quantity?", "acceleration", "easy"),
              MULTI("Which of the following are action-reaction pairs?", ["Gravity exerted by Earth on a ball and ball exerted on Earth", "Friction on a sliding block and block on the surface", "A horse pulling a cart and cart pulling the horse", "Weight of a book on a table and normal force of book on table"], [0, 2], "hard"),
            ],
          },
          {
            name: "Work, Energy and Power",
            description: "Work-energy theorem, conservation of energy, power",
            questions: [
              MCQ("Work done by centripetal force in uniform circular motion over one complete revolution is:", ["mv²", "2πr", "0", "mg"], 2, "medium"),
              MCQ("A 2 kg body moving at 6 m/s is brought to rest in 3 m. The force applied is:", ["12 N", "24 N", "36 N", "6 N"], 1, "medium"),
              NAQ("The rate of doing work is called what?", "power", "easy"),
              MULTI("In a perfectly inelastic collision, which are conserved?", ["Momentum", "Kinetic energy", "Total mass", "Linear velocity"], [0, 2], "medium"),
            ],
          },
          {
            name: "Rotational Motion",
            description: "Moment of inertia, torque and angular momentum",
            questions: [
              MCQ("Moment of inertia of a uniform disc of mass M and radius R about an axis through its centre and perpendicular to its plane is:", ["MR²", "MR²/2", "2MR²/5", "MR²/4"], 1, "medium"),
              MCQ("A figure skater pulls in her arms and spins faster because of conservation of:", ["Energy", "Angular momentum", "Torque", "Linear momentum"], 1, "easy"),
              NAQ("The rotational analogue of force is torque, and the analogue of linear momentum is angular what?", "momentum", "easy"),
              MULTI("For a rigid body in pure rotation, which statements are true?", ["All particles have the same angular velocity", "All particles have the same linear velocity", "Centripetal acceleration depends on distance from axis", "Angular acceleration must be zero"], [0, 2], "medium"),
            ],
          },
        ],
      },
      {
        name: "Chemistry",
        code: "CHE-101",
        credits: 4,
        description: "Physical and inorganic chemistry fundamentals",
        units: [
          { unit_number: 1, title: "Physical Chemistry", topics: ["Atomic Structure", "Chemical Bonding", "Chemical Thermodynamics", "Equilibrium"] },
        ],
        topics: [
          {
            name: "Atomic Structure",
            description: "Quantum numbers, orbitals and electronic configuration",
            questions: [
              MCQ("The maximum number of electrons in a shell with principal quantum number n = 3 is:", ["8", "18", "32", "2"], 1, "easy"),
              MCQ("Which quantum number describes the orientation of an orbital?", ["Principal", "Azimuthal", "Magnetic", "Spin"], 2, "easy"),
              NAQ("The orbital with angular momentum quantum number l = 0 is called an s orbital. What does 's' stand for in spectroscopic notation?", "sharp", "medium"),
              MULTI("Which of the following sets of quantum numbers is/are possible for an electron?", ["n = 2, l = 1, m = 0", "n = 3, l = 2, m = +2", "n = 1, l = 1, m = 0", "n = 4, l = 3, m = -3"], [0, 1, 3], "hard"),
            ],
          },
          {
            name: "Chemical Bonding",
            description: "Ionic, covalent and coordinate bonding; VSEPR",
            questions: [
              MCQ("The hybridisation of carbon in methane (CH₄) is:", ["sp", "sp²", "sp³", "sp³d"], 2, "easy"),
              MCQ("Which has the highest lattice energy?", ["NaCl", "KCl", "MgO", "LiF"], 2, "medium"),
              NAQ("According to VSEPR theory, the shape of a molecule with 4 bond pairs and 0 lone pairs is tetrahedral. What is the bond angle in degrees (integer)?", "109", "easy"),
              MULTI("Which of the following molecules exhibit hydrogen bonding?", ["HF", "HCl", "H₂O", "CH₄"], [0, 2], "medium"),
            ],
          },
          {
            name: "Chemical Thermodynamics",
            description: "Enthalpy, entropy and Gibbs free energy",
            questions: [
              MCQ("For an exothermic reaction, ΔH is:", ["Positive", "Negative", "Zero", "Always equal to ΔS"], 1, "easy"),
              MCQ("A spontaneous process at constant T and P has ΔG:", ["ΔG > 0", "ΔG < 0", "ΔG = 0", "ΔG = ΔH"], 1, "easy"),
              NAQ("The enthalpy change when one mole of a substance burns completely in oxygen is called heat of what? (one word)", "combustion", "medium"),
              MULTI("Which are state functions?", ["Internal energy", "Heat", "Enthalpy", "Work"], [0, 2], "medium"),
            ],
          },
          {
            name: "Equilibrium",
            description: "Le Chatelier's principle, Kp/Kc and pH",
            questions: [
              MCQ("For the reaction N₂ + 3H₂ ⇌ 2NH₃, Kc expression is:", ["[NH₃]² / ([N₂][H₂]³)", "[NH₃] / ([N₂][H₂])", "[N₂][H₂]³ / [NH₃]²", "[NH₃]² / ([N₂]²[H₂]³)"], 0, "medium"),
              MCQ("A solution with pH = 3 has H⁺ concentration:", ["3 M", "10⁻³ M", "10³ M", "1 M"], 1, "easy"),
              NAQ("Adding inert gas at constant volume to a gaseous equilibrium shifts the position in which direction? (write 'left' or 'right' or 'no')", "no", "medium"),
              MULTI("According to Le Chatelier's principle, increasing pressure on N₂ + 3H₂ ⇌ 2NH₃ (all gases) will:", ["Shift equilibrium to the right", "Shift equilibrium to the left", "Increase ammonia yield", "Decrease the value of Kc"], [0, 2], "medium"),
            ],
          },
        ],
      },
      {
        name: "Mathematics",
        code: "MAT-101",
        credits: 4,
        description: "Algebra, calculus and probability for JEE",
        units: [
          { unit_number: 1, title: "Algebra & Calculus", topics: ["Quadratic Equations", "Trigonometric Ratios", "Limits and Derivatives", "Probability"] },
        ],
        topics: [
          {
            name: "Quadratic Equations",
            description: "Roots, discriminant and nature of roots",
            questions: [
              MCQ("If the roots of x² - 5x + 6 = 0 are α and β, then α + β equals:", ["-5", "5", "6", "-6"], 1, "easy"),
              MCQ("The discriminant of 2x² + 3x + 5 = 0 is:", ["9 - 40 = -31", "9 + 40 = 49", "31", "16"], 0, "easy"),
              NAQ("For real roots, the discriminant b² - 4ac must be greater than or equal to what value?", "0", "easy"),
              MULTI("For the equation x² - 4x + 4 = 0, which statements are true?", ["It has two equal real roots", "The discriminant is zero", "The roots are 2 and 2", "It has no real roots"], [0, 1, 2], "medium"),
            ],
          },
          {
            name: "Trigonometric Ratios",
            description: "Identities, compound angles and equations",
            questions: [
              MCQ("The value of sin 30° + cos 60° is:", ["1", "1/2", "√3/2", "0"], 0, "easy"),
              MCQ("sin²θ + cos²θ equals:", ["0", "1", "2", "tan²θ"], 1, "easy"),
              NAQ("tan θ = sin θ / cos θ. tan 45° equals what integer?", "1", "easy"),
              MULTI("Which of the following identities are correct?", ["sin(2θ) = 2 sinθ cosθ", "cos(A+B) = cosA cosB - sinA sinB", "1 + tan²θ = sec²θ", "sin(A+B) = sinA + sinB"], [0, 1, 2], "medium"),
            ],
          },
          {
            name: "Limits and Derivatives",
            description: "Limit rules, continuity and differentiation",
            questions: [
              MCQ("lim(x→0) sin x / x equals:", ["0", "1", "∞", "undefined"], 1, "easy"),
              MCQ("The derivative of x³ is:", ["x²", "3x²", "3x", "x³/3"], 1, "easy"),
              NAQ("The derivative of sin x is cos x. The derivative of cos x is negative of what function?", "sin", "easy"),
              MULTI("If f(x) = x², which are true?", ["f'(x) = 2x", "f'(0) = 0", "f'(2) = 4", "f'(x) = x"], [0, 1, 2], "easy"),
            ],
          },
          {
            name: "Probability",
            description: "Conditional probability, Bayes' theorem and distributions",
            questions: [
              MCQ("Two fair dice are rolled. Probability of getting a sum of 7 is:", ["1/6", "1/9", "1/12", "7/36"], 0, "medium"),
              MCQ("If A and B are independent events with P(A) = 0.5 and P(B) = 0.4, then P(A ∩ B) is:", ["0.9", "0.2", "0.1", "0.8"], 1, "easy"),
              NAQ("A coin is tossed 3 times. Number of total possible outcomes is?", "8", "easy"),
              MULTI("For any event A with 0 < P(A) < 1, which are true?", ["P(A') = 1 - P(A)", "P(A ∪ A') = 1", "0 ≤ P(A) ≤ 1", "P(A) can be negative"], [0, 1, 2], "easy"),
            ],
          },
        ],
      },
    ],
  },
  {
    name: "NEET 2026 Mock Series",
    description: "NCERT-based biology mocks for NEET 2026",
    duration: 180,
    total_marks: 720,
    subjects: [
      {
        name: "Biology",
        code: "BIO-101",
        credits: 6,
        description: "Cell biology, physiology and genetics",
        units: [
          { unit_number: 1, title: "Life Processes", topics: ["Cell: The Unit of Life", "Human Physiology", "Genetics and Evolution"] },
        ],
        topics: [
          {
            name: "Cell: The Unit of Life",
            description: "Cell structure, organelles and division",
            questions: [
              MCQ("Which organelle is known as the powerhouse of the cell?", ["Ribosome", "Mitochondria", "Golgi apparatus", "Lysosome"], 1, "easy"),
              MCQ("The cell theory was proposed by:", ["Robert Hooke", "Schleiden and Schwann", "Watson and Crick", "Leeuwenhoek"], 1, "medium"),
              NAQ("The power house of the cell is the mitochondrion. Ribosomes are the site of synthesis of what macromolecules?", "protein", "easy"),
              MULTI("Which of the following are true about prokaryotic cells?", ["They lack a nuclear membrane", "They have 70S ribosomes", "They contain membrane-bound organelles", "They have circular DNA"], [0, 1, 3], "medium"),
            ],
          },
          {
            name: "Human Physiology",
            description: "Digestion, circulation, excretion and control systems",
            questions: [
              MCQ("The pacemaker of the human heart is:", ["AV node", "SA node", "Bundle of His", "Purkinje fibres"], 1, "easy"),
              MCQ("Which hormone regulates blood sugar level by lowering it?", ["Glucagon", "Insulin", "Adrenaline", "Thyroxine"], 1, "easy"),
              NAQ("The functional unit of the kidney responsible for filtration is the nephron. Urine is stored temporarily in which organ?", "bladder", "easy"),
              MULTI("Which organs are part of the excretory system in humans?", ["Kidney", "Lung", "Skin", "Liver"], [0, 1, 2], "medium"),
            ],
          },
          {
            name: "Genetics and Evolution",
            description: "Mendelian genetics, DNA and natural selection",
            questions: [
              MCQ("In a monohybrid cross between two heterozygous tall pea plants, the phenotypic ratio in F₂ is:", ["1:1", "3:1", "9:3:3:1", "1:2:1"], 1, "medium"),
              MCQ("The number of chromosomes in a normal human gamete is:", ["46", "23", "44", "22"], 1, "easy"),
              NAQ("The genetic material of most organisms is a double helix polymer made of two strands. Name the molecule (abbreviation).", "dna", "easy"),
              MULTI("Which are correct about DNA replication?", ["It is semi-conservative", "It requires DNA polymerase", "It is bidirectional in eukaryotes", "RNA polymerase initiates it"], [0, 1, 2], "medium"),
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Mumbai University Semester Exam",
    description: "End semester examination",
    duration: 180,
    total_marks: 80,
    subjects: [
      {
        name: "Database Management System",
        code: "CSC502",
        credits: 4,
        description: "Introduction to database systems",
        units: [
          { unit_number: 2, title: "Relational Databases", topics: ["SQL: Advanced Queries", "Normalization & Functional Dependencies"] },
          { unit_number: 3, title: "Transaction Processing", topics: ["Transactions & Concurrency Control"] },
        ],
        topics: [
          {
            name: "SQL: Advanced Queries",
            description: "Joins, subqueries, aggregation and window functions",
            questions: [
              MCQ("Which SQL clause is used to filter groups after aggregation?", ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], 1, "medium"),
              MCQ("An INNER JOIN returns:", ["All rows from both tables", "Only rows with matches in both tables", "All rows from the left table", "Rows with no match"], 1, "easy"),
              NAQ("Which aggregate function returns the number of rows? (keyword)", "count", "easy"),
              MULTI("Which of the following are valid SQL aggregate functions?", ["SUM", "COUNT", "JOIN", "AVG"], [0, 1, 3], "easy"),
            ],
          },
          {
            name: "Normalization & Functional Dependencies",
            description: "1NF through BCNF, Armstrong's axioms",
            questions: [
              MCQ("A relation is in 2NF if it is in 1NF and:", ["Has no transitive dependencies", "No partial dependency on any candidate key", "All attributes are atomic", "Every determinant is a candidate key"], 1, "medium"),
              MCQ("Which normal form removes transitive dependencies?", ["1NF", "2NF", "3NF", "BCNF"], 2, "easy"),
              NAQ("Every BCNF relation is also in what normal form? (abbreviation)", "3nf", "medium"),
              MULTI("Regarding functional dependency X → Y, which are true?", ["X is a determinant", "It holds if every X value determines a unique Y value", "It is denoted by an arrow", "Y must be a primary key"], [0, 1, 2], "medium"),
            ],
          },
          {
            name: "Transactions & Concurrency Control",
            description: "ACID properties, serializability and locking",
            questions: [
              MCQ("Which ACID property ensures all-or-nothing execution?", ["Atomicity", "Consistency", "Isolation", "Durability"], 0, "easy"),
              MCQ("A schedule is conflict serializable if:", ["It is equivalent to some serial schedule under conflict operations", "It contains no conflicts", "It uses only shared locks", "It commits in order"], 0, "medium"),
              NAQ("The property ensuring committed transactions survive crashes is durability. ACID's 'I' stands for what?", "isolation", "easy"),
              MULTI("Which protocols prevent deadlock in concurrency control?", ["Two-phase locking with timeouts", "Wait-die", "Wound-wait", "Round-robin"], [0, 1, 2], "hard"),
            ],
          },
        ],
      },
      {
        name: "Operating Systems",
        code: "CSC501",
        credits: 4,
        description: "Processes, memory and file systems",
        units: [
          { unit_number: 1, title: "Process Management", topics: ["Process Management", "Deadlocks"] },
          { unit_number: 2, title: "Memory", topics: ["Memory Management"] },
        ],
        topics: [
          {
            name: "Process Management",
            description: "Process states, scheduling and threads",
            questions: [
              MCQ("Which scheduling algorithm can cause starvation of short jobs?", ["FCFS", "Round Robin", "Shortest Job First", "Priority (non-preemptive) with aging absent"], 2, "medium"),
              MCQ("A process in the 'ready' state is:", ["Waiting for I/O", "Waiting to be assigned to CPU", "Being executed", "Terminated"], 1, "easy"),
              NAQ("The CPU-scheduling algorithm that gives each process a fixed time slot in cyclic order is called Round what?", "robin", "easy"),
              MULTI("Which are valid process states?", ["Ready", "Waiting", "Running", "Compiled"], [0, 1, 2], "easy"),
            ],
          },
          {
            name: "Deadlocks",
            description: "Coffman conditions, detection and avoidance",
            questions: [
              MCQ("Which is NOT one of the four Coffman conditions for deadlock?", ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait", "Livelock"], 4, "medium"),
              MCQ("Banker's algorithm is used for:", ["Deadlock recovery", "Deadlock avoidance", "Deadlock detection", "Page replacement"], 1, "medium"),
              NAQ("A situation where processes wait for each other in a cycle is called a deadlock. Resolving it by killing a process is deadlock what? (one word)", "recovery", "medium"),
              MULTI("Which techniques prevent deadlock?", ["Breaking mutual exclusion", "Ordered resource allocation", "Preemption", "Circular wait prevention"], [1, 2, 3], "hard"),
            ],
          },
          {
            name: "Memory Management",
            description: "Paging, segmentation and virtual memory",
            questions: [
              MCQ("In paging, the logical address is split into:", ["Page number and offset", "Segment number and offset", "Base and limit", "Frame number only"], 0, "easy"),
              MCQ("The page replacement algorithm that replaces the page not used for the longest time is:", ["FIFO", "Optimal", "LRU", "Round Robin"], 2, "medium"),
              NAQ("Loading pages into memory only when needed is called demand what? (one word)", "paging", "medium"),
              MULTI("Advantages of virtual memory include:", ["Larger logical address space than physical memory", "Programs need not fit entirely in memory", "No page faults ever occur", "Better multiprogramming efficiency"], [0, 1, 3], "medium"),
            ],
          },
        ],
      },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Academic hierarchy (find-or-create)
    const university = (await University.findOne({ name: "Mumbai University" })) ||
      (await University.create({ name: "Mumbai University", code: "MU" }));
    const college = (await College.findOne({ name: "Engineering College" })) ||
      (await College.create({ name: "Engineering College", university_id: university._id }));
    const dept = (await Department.findOne({ name: "Computer Engineering" })) ||
      (await Department.create({ name: "Computer Engineering", code: "CE", college_id: college._id }));
    const semester = (await Semester.findOne({ number: 5 })) ||
      (await Semester.create({ name: "Semester 5", number: 5, department_id: dept._id }));

    // Users
    const users = {};
    for (const u of USERS) {
      let doc = await User.findOne({ email: u.email });
      if (!doc) {
        doc = await User.create({
          ...u,
          password: "password123",
          isVerified: true,
          ...(u.role === "student"
            ? { university_id: university._id, college_id: college._id, department_id: dept._id, semester_id: semester._id }
            : { department_id: dept._id }),
        });
        console.log(`  + user ${u.email}`);
      }
      users[u.email] = doc;
    }

    let examCount = 0, subjectCount = 0, unitCount = 0, topicCount = 0, questionCount = 0;

    for (const examDef of EXAMS) {
      let exam = await Exam.findOne({ name: examDef.name });
      if (!exam) {
        exam = await Exam.create({ name: examDef.name, description: examDef.description, duration: examDef.duration, total_marks: examDef.total_marks });
        examCount++;
      }

      for (const subjDef of examDef.subjects) {
        let subject = await Subject.findOne({ name: subjDef.name, exam_id: exam._id });
        if (!subject) {
          subject = await Subject.create({
            name: subjDef.name,
            code: subjDef.code,
            credits: subjDef.credits,
            description: subjDef.description,
            exam_id: exam._id,
            department_id: dept._id,
            semester_id: semester._id,
            assigned_faculty: [users["priya.faculty@demo.com"]._id, users["arjun.faculty@demo.com"]._id],
          });
          subjectCount++;
        }

        for (const unitDef of subjDef.units) {
          const exists = await Unit.findOne({ title: unitDef.title, subject_id: subject._id });
          if (!exists) {
            await Unit.create({ ...unitDef, subject_id: subject._id, order: unitDef.unit_number });
            unitCount++;
          }
        }

        for (const topicDef of subjDef.topics) {
          let topic = await Topic.findOne({ name: topicDef.name, subject_id: subject._id });
          if (!topic) {
            topic = await Topic.create({ name: topicDef.name, subject_id: subject._id, description: topicDef.description });
            topicCount++;
          }

          const existing = await Question.countDocuments({ topic_id: topic._id });
          if (existing === 0 && topicDef.questions.length > 0) {
            await Question.insertMany(topicDef.questions.map((q) => ({ ...q, topic_id: topic._id })));
            questionCount += topicDef.questions.length;
          }
        }
      }
    }

    // Completed attempts (deterministic mix of right/wrong) + one in-progress
    let attemptCount = 0;
    const students = ["aarav@demo.com", "diya@demo.com", "rohan@demo.com", "ananya@demo.com", "kabir@demo.com", "sara@demo.com"];
    const attemptPlan = [
      { student: "aarav@demo.com", exam: "JEE Main 2026 Test Series", subject: "Physics", topic: "Kinematics", correct: 3, wrong: 1, time: 420, violations: 0 },
      { student: "aarav@demo.com", exam: "JEE Main 2026 Test Series", subject: "Mathematics", topic: "Quadratic Equations", correct: 4, wrong: 0, time: 310, violations: 0 },
      { student: "aarav@demo.com", exam: "Mumbai University Semester Exam", subject: "Operating Systems", topic: "Deadlocks", correct: 2, wrong: 1, time: 500, violations: 1 },
      { student: "diya@demo.com", exam: "JEE Main 2026 Test Series", subject: "Physics", topic: "Kinematics", correct: 4, wrong: 0, time: 280, violations: 0 },
      { student: "diya@demo.com", exam: "JEE Main 2026 Test Series", subject: "Chemistry", topic: "Atomic Structure", correct: 3, wrong: 1, time: 390, violations: 0 },
      { student: "diya@demo.com", exam: "Mumbai University Semester Exam", subject: "Database Management System", topic: "SQL: Advanced Queries", correct: 4, wrong: 0, time: 350, violations: 0 },
      { student: "rohan@demo.com", exam: "JEE Main 2026 Test Series", subject: "Chemistry", topic: "Chemical Bonding", correct: 2, wrong: 2, time: 610, violations: 2 },
      { student: "rohan@demo.com", exam: "JEE Main 2026 Test Series", subject: "Mathematics", topic: "Probability", correct: 3, wrong: 1, time: 470, violations: 0 },
      { student: "rohan@demo.com", exam: "Mumbai University Semester Exam", subject: "Operating Systems", topic: "Process Management", correct: 3, wrong: 1, time: 540, violations: 1 },
      { student: "ananya@demo.com", exam: "JEE Main 2026 Test Series", subject: "Physics", topic: "Rotational Motion", correct: 4, wrong: 0, time: 300, violations: 0 },
      { student: "ananya@demo.com", exam: "NEET 2026 Mock Series", subject: "Biology", topic: "Genetics and Evolution", correct: 3, wrong: 1, time: 430, violations: 0 },
      { student: "ananya@demo.com", exam: "Mumbai University Semester Exam", subject: "Database Management System", topic: "Normalization & Functional Dependencies", correct: 2, wrong: 1, time: 560, violations: 0 },
      { student: "kabir@demo.com", exam: "JEE Main 2026 Test Series", subject: "Mathematics", topic: "Limits and Derivatives", correct: 3, wrong: 1, time: 400, violations: 1 },
      { student: "kabir@demo.com", exam: "NEET 2026 Mock Series", subject: "Biology", topic: "Human Physiology", correct: 4, wrong: 0, time: 320, violations: 0 },
      { student: "kabir@demo.com", exam: "Mumbai University Semester Exam", subject: "Operating Systems", topic: "Memory Management", correct: 2, wrong: 2, time: 680, violations: 2 },
      { student: "sara@demo.com", exam: "JEE Main 2026 Test Series", subject: "Physics", topic: "Work, Energy and Power", correct: 4, wrong: 0, time: 290, violations: 0 },
      { student: "sara@demo.com", exam: "NEET 2026 Mock Series", subject: "Biology", topic: "Cell: The Unit of Life", correct: 3, wrong: 1, time: 450, violations: 0 },
      { student: "sara@demo.com", exam: "Mumbai University Semester Exam", subject: "Database Management System", topic: "Transactions & Concurrency Control", correct: 3, wrong: 0, time: 380, violations: 0 },
    ];

    for (const plan of attemptPlan) {
      const student = users[plan.student];
      const exam = await Exam.findOne({ name: plan.exam });
      const subject = await Subject.findOne({ name: plan.subject, exam_id: exam._id });
      if (!subject) continue;
      const topic = await Topic.findOne({ name: plan.topic, subject_id: subject._id });
      if (!topic) continue;

      const already = await TestAttempt.findOne({ student_id: student._id, topic_id: topic._id, status: "completed" });
      if (already) continue;

      const questions = await Question.find({ topic_id: topic._id }).lean();
      if (questions.length === 0) continue;

      const attempt = await TestAttempt.create({
        student_id: student._id,
        topic_id: topic._id,
        score: plan.correct,
        total_correct: plan.correct,
        total_wrong: plan.wrong,
        total_questions: questions.length,
        time_taken: plan.time,
        violations: plan.violations,
        status: "completed",
      });

      const answerRecords = [];
      questions.forEach((q, i) => {
        const isCorrect = i < plan.correct;
        if (q.type === "NAQ") {
          answerRecords.push({
            attempt_id: attempt._id,
            question_id: q._id,
            typed_answer: isCorrect ? q.correct_answer : "wrong answer",
            is_correct: isCorrect,
          });
        } else {
          const opt = isCorrect
            ? q.options.find((o) => o.is_correct)
            : q.options.find((o) => !o.is_correct);
          if (opt) {
            answerRecords.push({
              attempt_id: attempt._id,
              question_id: q._id,
              selected_option: opt._id,
              is_correct: isCorrect,
            });
          }
        }
      });
      await TestAttemptAnswer.insertMany(answerRecords);
      attemptCount++;
    }

    // One in-progress attempt so /attempts/active has data
    const activeStudent = users["diya@demo.com"];
    const jeeExam = await Exam.findOne({ name: "JEE Main 2026 Test Series" });
    const chemSubject = await Subject.findOne({ name: "Chemistry", exam_id: jeeExam._id });
    const activeTopic = await Topic.findOne({ name: "Equilibrium", subject_id: chemSubject._id });
    if (activeTopic) {
      const activeExists = await TestAttempt.findOne({ student_id: activeStudent._id, topic_id: activeTopic._id, status: "in_progress" });
      if (!activeExists) {
        const activeQs = await Question.countDocuments({ topic_id: activeTopic._id });
        await TestAttempt.create({
          student_id: activeStudent._id,
          topic_id: activeTopic._id,
          total_questions: activeQs,
          status: "in_progress",
        });
        attemptCount++;
      }
    }

    const totals = {
      users: await User.countDocuments(),
      exams: await Exam.countDocuments(),
      subjects: await Subject.countDocuments(),
      units: await Unit.countDocuments(),
      topics: await Topic.countDocuments(),
      questions: await Question.countDocuments(),
      attempts: await TestAttempt.countDocuments(),
    };

    console.log("\nSeeded this run:", { examCount, subjectCount, unitCount, topicCount, questionCount, attemptCount });
    console.log("DB totals:", totals);
    console.log("\nDemo logins (password: password123):");
    console.log("  Admin:    admin@demo.com");
    console.log("  Faculty:  priya.faculty@demo.com / arjun.faculty@demo.com");
    console.log("  Students: aarav@ / diya@ / rohan@ / ananya@ / kabir@ / sara@ demo.com");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
