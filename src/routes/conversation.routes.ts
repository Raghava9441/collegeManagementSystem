import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createOpenConversation, getConversations } from "../controllers/conversation.controllers";

const router = Router();

// Create New Conversation Route
router
    .route("/create-open-conversation")
    .post(verifyJWT, createOpenConversation);

router
    .route("/get-conversations")
    .get(verifyJWT, getConversations);

export default router;