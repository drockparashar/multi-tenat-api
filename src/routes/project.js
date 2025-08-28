import { Router } from "express";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = Router();

// List all projects in organization (all roles)
router.get("/", authenticateJWT, listProjects);

// Get a single project by ID (all roles)
router.get("/:id", authenticateJWT, getProject);

// Create a new project (manager, admin)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("manager", "admin"),
  createProject
);

// Update a project (manager, admin)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("manager", "admin"),
  updateProject
);

// Delete a project (admin only)
router.delete("/:id", authenticateJWT, authorizeRoles("admin"), deleteProject);

export default router;
