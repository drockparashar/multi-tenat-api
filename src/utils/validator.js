import { body } from "express-validator";

// Example validators for user registration
export const registerValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("organization").notEmpty().withMessage("Organization is required"),
];

// Example validators for project creation
export const projectValidator = [
  body("name").notEmpty().withMessage("Project name is required"),
];
