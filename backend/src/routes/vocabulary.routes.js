import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addVocabulary, deleteVocabulary, getVocabulary, updateVocabulary, exportVocabulary } from "../controllers/vocabulary.controller.js";

const router = express.Router();

router.get("/", protectRoute, getVocabulary);
router.get("/export", protectRoute, exportVocabulary);
router.post("/", protectRoute, addVocabulary);
router.put("/:id", protectRoute, updateVocabulary);
router.delete("/:id", protectRoute, deleteVocabulary);

export default router;
