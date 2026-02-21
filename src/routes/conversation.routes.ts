import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createOpenConversation, getConversations } from "../controllers/conversation.controllers";

const router = Router();

/**
 * @swagger
 * /conversations/create-open-conversation:
 *   post:
 *     summary: Create open conversation
 *     tags: [Conversations]
 *     description: Create an open conversation with another user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: Receiver user ID
 *     responses:
 *       200:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /conversations/get-conversations:
 *   get:
 *     summary: Get conversations
 *     tags: [Conversations]
 *     description: Get list of conversations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Create New Conversation Route
router
    .route("/create-open-conversation")
    .post(verifyJWT, createOpenConversation);

router
    .route("/get-conversations")
    .get(verifyJWT, getConversations);

export default router;