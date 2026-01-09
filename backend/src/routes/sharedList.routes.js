import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createSharedList,
  getMySharedLists,
  getSharedWithMe,
  getSharedList,
  addCollaborator,
  removeCollaborator,
  addWordToSharedList,
  deleteWordFromSharedList,
  deleteSharedList,
} from "../controllers/sharedList.controller.js";

const router = express.Router();

router.post("/", protectRoute, createSharedList);
router.get("/my-lists", protectRoute, getMySharedLists);
router.get("/shared-with-me", protectRoute, getSharedWithMe);
router.get("/:id", protectRoute, getSharedList);
router.post("/:id/collaborator", protectRoute, addCollaborator);
router.delete("/:id/collaborator/:friendId", protectRoute, removeCollaborator);
router.post("/:id/word", protectRoute, addWordToSharedList);
router.delete("/:id/word/:wordId", protectRoute, deleteWordFromSharedList);
router.delete("/:id", protectRoute, deleteSharedList);

export default router;
