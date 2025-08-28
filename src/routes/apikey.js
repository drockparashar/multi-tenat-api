import { Router } from "express";
import {
  generateApiKey,
  listApiKeys,
  revokeApiKey,
  rotateApiKey,
} from "../controllers/apikeyController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = Router();

// Generate a new API key (admin only)
router.post("/", authenticateJWT, authorizeRoles("admin"), generateApiKey);

// List all API keys for organization (admin only)
router.get("/", authenticateJWT, authorizeRoles("admin"), listApiKeys);

// Revoke an API key (admin only)
router.post(
  "/:id/revoke",
  authenticateJWT,
  authorizeRoles("admin"),
  revokeApiKey
);

// Rotate (regenerate) an API key (admin only)
router.post(
  "/:id/rotate",
  authenticateJWT,
  authorizeRoles("admin"),
  rotateApiKey
);

export default router;
