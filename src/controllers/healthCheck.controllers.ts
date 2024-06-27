import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const healthCheckControllers = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "OK", "Health Check API is working"));
})


export { healthCheckControllers };
