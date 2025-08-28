import { Router } from "express";
import {
  createOrganization,
  listOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organizationController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = Router();

// Create organization (admin only)
router.post("/", authenticateJWT, authorizeRoles("admin"), createOrganization);

// List all organizations (admin only)
router.get("/", authenticateJWT, authorizeRoles("admin"), listOrganizations);

// Get a single organization by ID (admin only)
router.get("/:id", authenticateJWT, authorizeRoles("admin"), getOrganization);

// Update organization (admin only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  updateOrganization
);

// Delete organization (admin only)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  deleteOrganization
);

export default router;
