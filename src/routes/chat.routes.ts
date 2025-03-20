import { createChat, getMessages, getUserChats, sendMessage } from "../controllers/chat.controllers";
import { Router } from "express";

const router = Router();

// Create a chat (if not already exists)
router.post("/create", createChat);

// Get all chats for a user
router.get("/", getUserChats);

// Send a message
router.post("/send", sendMessage);

// Get messages from a specific chat
router.get("/:chatId/messages", getMessages);

export default router;
