import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getMessages, sendMessage } from "../controllers/message.controllers";


const router = Router();

router
    .post(
        "/send-message",
        verifyJWT,
        sendMessage
    );

// Get all chats for a user
router
    .get("/get-messages/:convo_id",
        verifyJWT,
        getMessages
    );

export default router;
