import express from "express";
import { protect } from "../middleware/auth.middleware.js";
// Import the Logic
import { createRoom, getNearbyRooms } from "../controllers/roomController.js";

const router = express.Router();

router.post("/create",protect, createRoom);
router.get("/nearby",protect, getNearbyRooms);

export default router;
