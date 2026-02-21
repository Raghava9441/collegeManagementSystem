import { Router } from "express";
import { healthCheckControllers } from "../controllers/healthCheck.controllers";

const router = Router();
/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Health Check
 *     tags: [Health Check]
 *     description: Endpoint to check the health status of the API.
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *               example:
 *                 success: true
 *                 message: "API is healthy"
 *                 timestamp: "2023-01-01T00:00:00.000Z"
 *                 uptime: 3600
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route("/").get(healthCheckControllers)

export default router 