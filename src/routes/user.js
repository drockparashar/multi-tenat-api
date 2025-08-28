import { Router } from "express";
import { listUsers, getUser } from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = Router();

// List all users in organization (admin only)
router.get("/", authenticateJWT, authorizeRoles("admin"), listUsers);

// Get a single user in organization (admin only)
router.get("/:id", authenticateJWT, authorizeRoles("admin"), getUser);

export default router;
