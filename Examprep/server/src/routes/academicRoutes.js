import { Router } from "express";
import {
  createUniversity,
  getUniversities,
  createCollege,
  getColleges,
  createDepartment,
  getDepartments,
  createSemester,
  getSemesters,
} from "../controllers/academicController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

import { seedDemoCurriculum } from "../controllers/seedController.js";

const router = Router();

// Only admin can create, anyone authenticated can view
router.post("/universities", authenticate, authorize("admin"), createUniversity);
router.get("/universities", authenticate, getUniversities);

router.post("/colleges", authenticate, authorize("admin"), createCollege);
router.get("/colleges", authenticate, getColleges);

router.post("/departments", authenticate, authorize("admin"), createDepartment);
router.get("/departments", authenticate, getDepartments);

router.post("/semesters", authenticate, authorize("admin"), createSemester);
router.get("/semesters", authenticate, getSemesters);

router.post("/seed", authenticate, authorize("admin"), seedDemoCurriculum);

export default router;
