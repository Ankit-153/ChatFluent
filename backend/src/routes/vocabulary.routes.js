import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addVocabulary, deleteVocabulary, getVocabulary } from "../controllers/vocabulary.controller.js";

const router = express.Router();

router.get("/", protectRoute, getVocabulary);
router.post("/", protectRoute, addVocabulary);
router.delete("/:id", protectRoute, deleteVocabulary);

export default router;
