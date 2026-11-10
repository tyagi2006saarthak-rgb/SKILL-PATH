import { Router } from "express";
import { body } from "express-validator";
import { guest, login, me, register } from "../controllers/authController.js";
import * as app from "../controllers/appController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const emailRule = body("email").isEmail().withMessage("Enter a valid email address.");

router.post("/auth/register", [
  body("name").trim().notEmpty().withMessage("Name is required."),
  emailRule,
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
], register);
router.post("/auth/login", [emailRule, body("password").notEmpty().withMessage("Password is required.")], login);
router.post("/auth/guest", guest);
router.get("/auth/me", requireAuth, me);
router.use(requireAuth);
router.get("/skills", app.listSkills);
router.post("/skills", app.createSkill);
router.put("/skills/:id", app.updateSkill);
router.delete("/skills/:id", app.deleteSkill);
router.get("/careers", app.listCareers);
router.get("/careers/:id", app.getCareer);
router.post("/analysis/:id", app.analyzeCareer);
router.post("/roadmaps/generate", app.generateRoadmap);
router.get("/roadmaps", app.listRoadmaps);
router.get("/roadmaps/:id", app.getRoadmap);
router.put("/roadmaps/:roadmapId/tasks/:taskId/status", app.updateTaskStatus);
router.delete("/roadmaps/:roadmapId/tasks/:taskId", app.deleteTask);
router.get("/dashboard/stats", app.dashboardStats);
router.get("/progress", app.progressSummary);
router.get("/profile", app.getProfile);
router.put("/profile", app.updateProfile);

export default router;
