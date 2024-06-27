import { Router } from "express";
import { healthCheckControllers } from "../controllers/healthCheck.controllers";

const router = Router();

router.route("/").get(healthCheckControllers)

export default router 