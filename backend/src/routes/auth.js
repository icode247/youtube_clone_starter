// backend/src/routes/auth.js
import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Get current user
router.get("/me", authController.getCurrentUser);

export default router;
