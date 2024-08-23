import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";

//this file is for handling errors globally
//this file writen over the years this is standard way of handling errors
const errorHandler = (err: any, req: any, res: any, next: any) => {
    let error = err;
    console.log("error:", error)
    if (!(err instanceof ApiError)) {
        const statusCode = err.statusCode || mongoose.Error ? 400 : 500;
        const message = error.message || 'Something went wrong';
        error = new ApiError(statusCode, message, error?.errors || [], error?.stack);
    }
    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' ? {
            stack: error.stack,
        } : {}),
    }
    return res.status(error.statusCode).json(response);
}
export { errorHandler }