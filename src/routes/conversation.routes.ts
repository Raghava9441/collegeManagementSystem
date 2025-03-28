import { createOpenConversation, getConversations } from "@controllers/conversation.controllers";
import { Router } from "express";
import { verifyJWT } from "middlewares/auth.middleware";

const router = Router();

// Create New Conversation Route
router
    .route("/create-open-conversation")
    .post(verifyJWT, createOpenConversation);

router
    .route("/get-conversations")
    .get(verifyJWT, getConversations);

export default router;