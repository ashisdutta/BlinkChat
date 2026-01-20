import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getRoomMessages } from "../controllers/chatController.js";

// Import the Logic
import {
  allJoinedRooms,
  createRoom,
  getNearbyRooms,
  joinRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", protect, createRoom);
router.get("/nearby", protect, getNearbyRooms);
router.post("/join", protect, joinRoom);
router.get("/joined", protect, allJoinedRooms);

router.get("/:roomId/messages", protect, getRoomMessages);

export default router;
