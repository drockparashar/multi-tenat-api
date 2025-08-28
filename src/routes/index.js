import { Router } from "express";
import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import organizationRoutes from "./organization.js";
import projectRoutes from "./project.js";
import apiKeyRoutes from "./apikey.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/organizations", organizationRoutes);
router.use("/projects", projectRoutes);
router.use("/apikeys", apiKeyRoutes);

export default router;
