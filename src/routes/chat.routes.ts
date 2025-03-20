import { verifyJWT } from "middlewares/auth.middleware";
import { createChat, getMessages, getUserChats, sendMessage } from "../controllers/chat.controllers";
import { Router } from "express";

const router = Router();

// Create a chat (if not already exists)
router
    .post(
        "/create",
        verifyJWT,
        createChat
    );

// Get all chats for a user
router
    .get("/",
        verifyJWT,
        getUserChats
    );

// Send a message
router.post(
    "/send",
    verifyJWT,
    sendMessage
);

// Get messages from a specific chat
router.get(
    "/:chatId/messages",
    verifyJWT,
    getMessages
);

export default router;
