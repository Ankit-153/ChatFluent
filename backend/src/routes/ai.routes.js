import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { generateWordDetails } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/word-details", protectRoute, generateWordDetails);

export default router;
