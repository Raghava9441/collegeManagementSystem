import { Router } from "express";
import { healthCheckControllers } from "../controllers/healthCheck.controllers";

const router = Router();
/**
 * @swagger
 * /api/v1/healthcheck:
 *   get:
 *     summary: Health Check
 *     description: Endpoint to check the health status of the API.
 *     responses:
 *       200:
 *         description: Returns the health status
 */
router.route("/").get(healthCheckControllers)

export default router 